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
import {lockAda} from './src/lockAda.ts';

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
		// https://www.hyperion-bt.org/helios-book/api/reference/address.html?highlight=Address#address
		const aliceUtxos = await alice.utxos;
		// todo
		expect(alice.address.toHex().length).toBe(58)
		// todo
		expect(aliceUtxos[1].value.dump().lovelace).toBe('50000000')
		// todo
		expect(validatorHash.hex).toBe('0502e977b1b2d1be41edabd19401d65d43f1d936f82297b72c71663c')
	})

	it ("locks funds and tries to unlock as the owner", async ({network, alice, bob, program}) => {
		const optimize = false; // need to add it to the context
		// Compile the Helios script
		// It seems like I need to compile script every time, do I?
		// If I want to have smaller context, does it really matter in the big picture?
		// Yeah, clean code; code rot, I should think about this
		const compiledScript = program.compile(optimize);
		const validatorHash = compiledScript.validatorHash;
		const validatorAddress = Address.fromValidatorHash(validatorHash);
		
		const adaQty = 10;
		const duration = 1000000;
		// --------------------maybe-program-?------v
		await lockAda(network!, alice!, bob!, validatorHash, adaQty, duration)
		expect((await alice.utxos)[0].value.dump().lovelace).toBe('50000000');
		expect((await alice.utxos)[1].value.dump().lovelace).toBe('9753780');

		// building Cancel tx
		const keyMPH = '49b106e698de78171de2faf35932635e1085c12508ca87718a2d4487'

		const minAda : number = 2000000; // minimum lovelace needed to send an NFT
		const maxTxFee: number = 500000; // maximum estimated transaction fee
		const minChangeAmt: number = 1000000; // minimum lovelace needed to be sent back as change
		const minUTXOVal = new Value(BigInt(minAda + maxTxFee + minChangeAmt));

		// Start building the transaction
		const tx = new Tx();	

		// who's address is here?
		// the agent that created a utxo by locking ADA can cancel.
		const ownerAddress = alice.address;
		const ownerUtxos = await alice.utxos;

		expect(ownerUtxos[0].value.dump().lovelace).toBe('50000000');

		const valRedeemer = new ConstrData(0, []);

		// compare to https://github.com/lley154/helios-examples/blob/704cf0a92cfe252b63ffb9fd36c92ffafc1d91f6/vesting/pages/index.tsx#L283
		const valUtxo = (await network.getUtxos(validatorAddress))[0]
		expect(Object.keys(valUtxo.value.dump().assets)[0]).toEqual(keyMPH)

		tx.addInput(valUtxo, valRedeemer);

		// Send the value of the of the valUTXO back to the owner
		tx.addOutput(new TxOutput(ownerAddress, valUtxo.value));

		// Specify when this transaction is valid from.   This is needed so
		// time is included in the transaction which will be use by the validator
		// script.  Add two hours for time to live and offset the current time
		// by 5 mins.
		const emulatorDate = 1677108984000;  // from src/preprod.json
		const currentTime = new Date(emulatorDate);
		const earlierTime = new Date(currentTime - 5 * 60 * 1000);
		const laterTime = new Date(currentTime + 2000 * 60 * 60 * 1000);

		tx.validFrom(earlierTime);
		tx.validTo(laterTime);

		// Add the recipiants pkh
		tx.addSigner(ownerAddress.pubKeyHash);

		// Add the validator script to the transaction
		tx.attachScript(compiledScript);

		const colatUtxo = ownerUtxos[0];
		const spareUtxo = ownerUtxos[1];
		expect(colatUtxo.value.dump().lovelace).toBe('50000000');
		tx.addCollateral(colatUtxo);

		const networkParamsFile = await fs.readFile('./src/preprod.json', 'utf8');
		const networkParams = new NetworkParams(JSON.parse(networkParamsFile.toString()));

		await tx.finalize(networkParams, ownerAddress, [spareUtxo]);

		expect(tx.dump()).toBe()

		const txId = await network.submitTx(tx);
		network.tick(BigInt(10));

		expect(alice.utxos).toBe()
		})
})
