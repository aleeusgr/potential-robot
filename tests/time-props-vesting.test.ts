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

describe("what happens when we add wait interval between lock and cancel?", async () => {

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

		const networkParamsFile = await fs.readFile('./src/preprod.json', 'utf8');
		const networkParams = new NetworkParams(JSON.parse(networkParamsFile.toString()));

		context.networkParams = networkParams;
	})

	it ("documents properties", async ({network, alice, validatorHash}) => {
		// https://www.hyperion-bt.org/helios-book/api/reference/address.html?highlight=Address#address
		expect(alice.address.toHex().length).toBe(58)
		// UTxOs
		expect((await alice.utxos)[0].value.dump().lovelace).toBe('20000000');
		expect((await alice.utxos)[1].value.dump().lovelace).toBe('50000000');

		// https://www.hyperion-bt.org/helios-book/lang/builtins/validatorhash.html?highlight=valida#validatorhash
		expect(validatorHash.hex).toBe('e7015c6a1424d748f8241fe3a43b3a382b35dc9ca67320e3ee863dc8')


	})

	it ("succeeds cancellation", async ({network, alice, bob, program}) => {
		const optimize = false; // need to add it to the context
		const compiledScript = program.compile(optimize);
		const validatorHash = compiledScript.validatorHash;
		const validatorAddress = Address.fromValidatorHash(validatorHash);

		const adaQty = 10;
		const duration = 1000000;
		await lockAda(network!, alice!, bob!, program, adaQty, duration);
		expect((await alice.utxos)[0].value.dump().lovelace).toBe('50000000');
		expect((await alice.utxos)[1].value.dump().lovelace).toBe('9755287');

		// https://www.hyperion-bt.org/helios-book/api/reference/fuzzytest.html?highlight=fuzz#fuzzytest
		network.tick(BigInt(10780));
		
		await cancelVesting(network!, alice!, program );

		const oracle = await alice.utxos;

		// think about which is which.
		expect(oracle[2].value.dump().lovelace).toBe('9546007'); 
		expect(oracle[1].value.dump().lovelace).toBe('10000000');//  
		expect(oracle[0].value.dump().lovelace).toBe('50000000');// collateral?
		})
	it.fails ("Error: tx invalid (not finalized or slot out of range) ", async ({network, alice, bob, program, networkParams}) => {
		const optimize = false; // need to add it to the context
		const compiledScript = program.compile(optimize);
		const validatorHash = compiledScript.validatorHash;
		const validatorAddress = Address.fromValidatorHash(validatorHash);

		const adaQty = 10;
		const duration = 1000000;
		await lockAda(network!, alice!, bob!, program, adaQty, duration);
		expect((await alice.utxos)[0].value.dump().lovelace).toBe('50000000');
		expect((await alice.utxos)[1].value.dump().lovelace).toBe('9755287');

		// https://www.hyperion-bt.org/helios-book/api/reference/fuzzytest.html?highlight=fuzz#fuzzytest
		network.tick(BigInt(10781));
		
		await cancelVesting(network!, alice!, program );

		const oracle = await alice.utxos;

		// think about which is which.
		expect(oracle[2].value.dump().lovelace).toBe('9546007'); 
		expect(oracle[1].value.dump().lovelace).toBe('10000000');//  
		expect(oracle[0].value.dump().lovelace).toBe('50000000');// collateral?
		})

	it ("describes the transaction", async ({network, alice, bob, program}) => {
		})
})
