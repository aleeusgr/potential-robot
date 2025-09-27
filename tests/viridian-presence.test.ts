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

describe("presence is a lottery", async () => {

	// https://vitest.dev/guide/test-context.html
	beforeEach(async (context) => { 
		let optimize = false;

		// compile script
		const script = await fs.readFile('./src/presence.hl', 'utf8'); 
		const program = Program.new(script);
		const compiledProgram = Program.new(script).compile(optimize); 
		const validatorHash = compiledProgram.validatorHash;
		const validatorAddress = Address.fromValidatorHash(validatorHash); 
	 
		context.validatorHash = validatorHash;
		context.validatorAddress = Address.fromValidatorHash(validatorHash); 

		// instantiate the emulated ledger
		const minAda = BigInt(2000000);  // minimum lovelace needed to send an NFT
		const network = new NetworkEmulator();

		const alice = network.createWallet(BigInt(20000000));
		network.createUtxo(alice, BigInt(5000000));
		const bob = network.createWallet(BigInt(10000000));
		network.tick(BigInt(10));

		context.alice = alice;
		context.bob = bob;
		context.network = network;
		context.program = program;

	})

	it ("assert properties", async ({network, alice, validatorHash}) => {
		// https://www.hyperion-bt.org/helios-book/api/reference/address.html?highlight=Address#address
		const aliceUtxos = await network.getUtxos(alice.address);
		// check some of the properties
		expect(alice.address.toHex().length).toBe(58)
		expect(aliceUtxos[1].value.dump().lovelace).toBe('5000000')
		expect(validatorHash.hex).toBe('9f43610b85b6c39eca3cdaa7824d289871e4eb2cdea62ac8eba3c7e1')
	})

	it ("traces steps: sponsor reclaims", async ({network, alice, bob, program }) => {
		// winner is identified by pkh:
		const winnerPkh = bob.pubKeyHash.toString();
		expect(winnerPkh).toBe("c2d1cd5f4af7621087d1b615518687097128a391a182f66d34cb53b8");

		// compile validator
		const optimize = false; // need to add it to the context
		const compiledScript = program.compile(optimize);
		const validatorHash = compiledScript.validatorHash;
		const validatorAddress = Address.fromValidatorHash(validatorHash);

		// create utxo
		const adaQty = 10; 
		const duration = 1000000; 
		await lockAda(network!, alice!, bob!, program, adaQty, duration);
		expect((await alice.utxos)[0].value.dump().lovelace).toBe('5000000');
		expect((await alice.utxos)[1].value.dump().lovelace).toBe('9831067');

		// redeem
		await cancelVesting(network!, alice!, program );

		const oracle = await alice.utxos;

		// think about which is which.
		expect(oracle[2].value.dump().lovelace).toBe('9622117'); 
		expect(oracle[1].value.dump().lovelace).toBe('10000000');//  
		expect(oracle[0].value.dump().lovelace).toBe('5000000');// collateral?

	})
})
