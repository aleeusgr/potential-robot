import { describe, expect, it, expectTypeOf, beforeEach, vi } from 'vitest'
import { promises as fs } from 'fs';
import {
  Address,
  Assets,
  ByteArrayData,
  ConstrData,
  Datum,
  hexToBytes,
  IntData,
  ListData,
  NetworkEmulator,
  NetworkParams,
  Program, 
  Tx,
  TxOutput,
  Value,
} from "@hyperionbt/helios";
import {lockAda} from './src/vesting-lock.ts';
import {cancelVesting} from './src/vesting-cancel.ts';

describe("a vesting contract: Cancel transaction", async () => {

	// https://vitest.dev/guide/test-context.html
	beforeEach(async (context) => { 
		let optimize = false;

		// compile script
		const script = await fs.readFile('./src/vesting.js', 'utf8'); 
		const program = Program.new(script);
		const compiledProgram = program.compile(optimize); 
		const validatorHash = compiledProgram.validatorHash;
		const validatorAddress = Address.fromValidatorHash(validatorHash); 
	 
		context.program = program;
		// 
		context.validatorHash = validatorHash;
		context.validatorAddress = Address.fromValidatorHash(validatorHash); 

		// instantiate the Emulator
		const minAda = BigInt(2000000);  // minimum lovelace needed to send an NFT
		const network = new NetworkEmulator();

		const alice = network.createWallet(BigInt(20000000));
		network.createUtxo(alice, BigInt(50000000));
		const bob = network.createWallet(BigInt(10000000));
		network.tick(BigInt(10));

		context.alice = alice;
		context.bob = bob;
		context.network = network;
	})

	it ("docs the tx ingridients", async ({network, alice, validatorHash}) => {
		// network.getUtxos(alice.address)
		// EmulatorWallet
		const aliceUtxos = await alice.utxos;
		// https://www.hyperion-bt.org/helios-book/api/reference/address.html?highlight=Address#address
		expect(alice.address.toHex().length).toBe(58)
		// UTxO
		expect(aliceUtxos[1].value.dump().lovelace).toBe('50000000')
		// https://www.hyperion-bt.org/helios-book/lang/builtins/validatorhash.html?highlight=valida#validatorhash
		expect(validatorHash.hex).toBe('e7015c6a1424d748f8241fe3a43b3a382b35dc9ca67320e3ee863dc8')

	})

	it ("locks funds and tries to unlock as the owner", async ({network, alice, bob, program}) => {
		// Obtain UPLC:
		// need to add it to the context
		// Compile the Helios script
		// It seems like I need to compile script every time, do I?
		// If I want to have smaller context, does it really matter in the big picture?
		// Yeah, clean code; code rot, I should think about this
		const optimize = false; 
		const compiledScript = program.compile(optimize);
		const validatorHash = compiledScript.validatorHash;
		const validatorAddress = Address.fromValidatorHash(validatorHash);
		//
		// Lock ADA:
		const adaQty = 10;
		const duration = 1000000;
		await lockAda(network!, alice!, bob!, program, adaQty, duration)
		expect((await alice.utxos)[0].value.dump().lovelace).toBe('50000000');
		expect((await alice.utxos)[1].value.dump().lovelace).toBe('9755287');


		const networkParamsFile = await fs.readFile('./src/preprod.json', 'utf8');
		const networkParams = new NetworkParams(JSON.parse(networkParamsFile.toString()));

		const keyMPH = '702cd6229f16532ca9735f65037092d099b0ff78a741c82db0847bbf'

		const ownerAddress = alice.address;
		const ownerUtxos = await alice.utxos;

		expect(ownerUtxos[0].value.dump().lovelace).toBe('50000000');

		const valRedeemer = new ConstrData(0, []);

		// compare to https://github.com/lley154/helios-examples/blob/704cf0a92cfe252b63ffb9fd36c92ffafc1d91f6/vesting/pages/index.tsx#L283
		const valUtxo = (await network.getUtxos(validatorAddress))[0]
		expect(Object.keys(valUtxo.value.dump().assets)[0]).toEqual(keyMPH)

		// Specify when this transaction is valid from.   This is needed so
		// time is included in the transaction which will be use by the validator
		// script. in NetworkEmulator, init slot is 0;
		const emulatorDate = Number(await networkParams.slotToTime(0n)); 

		const earlierTime = new Date(emulatorDate);
		const laterTime = new Date(emulatorDate + 3 * 60 * 60 * 1000);

		const colatUtxo = ownerUtxos[0];
		const spareUtxo = ownerUtxos[1];
		expect(colatUtxo.value.dump().lovelace).toBe('50000000');

		const tx = new Tx()
			.addInput(valUtxo, valRedeemer)
			.addOutput(new TxOutput(ownerAddress, valUtxo.value))
			.validFrom(earlierTime)
			.validTo(laterTime)
			.addSigner(ownerAddress.pubKeyHash)
			.attachScript(compiledScript)
			.addCollateral(colatUtxo);

		await tx.finalize(networkParams, ownerAddress, [spareUtxo]);

		expect(tx.dump().body.firstValidSlot).toBe('0')
		expect(tx.dump().body.lastValidSlot).toBe('10800')

		const txId = await network.submitTx(tx);
		network.tick(BigInt(10));

		const oracle = await alice.utxos;

		// think about which is which.
		expect(oracle[2].value.dump().lovelace).toBe('9546007'); 
		expect(oracle[1].value.dump().lovelace).toBe('10000000');//  
		expect(oracle[0].value.dump().lovelace).toBe('50000000');// collateral?
		})
	it ("tests cancelVesting.ts", async ({network, alice, bob, program}) => {
		const optimize = false; // need to add it to the context
		const compiledScript = program.compile(optimize);
		const validatorHash = compiledScript.validatorHash;
		const validatorAddress = Address.fromValidatorHash(validatorHash);
		
		const adaQty = 10;
		const duration = 1000000;
		await lockAda(network!, alice!, bob!, program, adaQty, duration);
		expect((await alice.utxos)[0].value.dump().lovelace).toBe('50000000');
		expect((await alice.utxos)[1].value.dump().lovelace).toBe('9755287');
		
		await cancelVesting(network!, alice!, program );

		const oracle = await alice.utxos;

		// think about which is which.
		expect(oracle[2].value.dump().lovelace).toBe('9546007'); 
		expect(oracle[1].value.dump().lovelace).toBe('10000000');//  
		expect(oracle[0].value.dump().lovelace).toBe('50000000');// collateral?
		})
})
