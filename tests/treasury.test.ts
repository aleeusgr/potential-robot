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

import {lockAda, cancelProject} from './src/treasury-txs.ts';

describe("rewards, bounty and treasury", async () => {
	// Background knowledge on testing Plutus:
	// https://plutus-pioneer-program.readthedocs.io/en/latest/week4.html
	beforeEach(async (context) => {
		let optimize = false;

		// prepare validator
		const script = await fs.readFile('./src/treasury.hl', 'utf8'); 
		const program = Program.new(script);
		const compiledProgram = program.compile(optimize); 
		const validatorHash = compiledProgram.validatorHash;
		const validatorAddress = Address.fromValidatorHash(validatorHash); 
	
		context.program = program;
		context.validatorHash = validatorHash;
		context.validatorAddress = Address.fromValidatorHash(validatorHash); 

		const minAda = BigInt(2000000);  // minimum lovelace needed to send an NFT

		// instantiate the emulator
		const network = new NetworkEmulator();
		const alice = network.createWallet(BigInt(20000000));
		network.createUtxo(alice, BigInt(50000000));
		const bob = network.createWallet(BigInt(10000000));
		network.tick(BigInt(10));

		context.alice = alice;
		context.bob = bob;
		context.network = network;

	})

	it ("asserts environment variables", async ({network, alice, validatorHash}) => {
		// Environment variables are external values that can affect the behavior of a program, such as a Plutus validator.
		// They are a set of dynamic values that exist outside the program's code and are used to configure or customize the program's behavior.

		// each user on Cardano is represented by a wallet address. 
		// The address is a string of 58 symbols:
		expect(alice.address.toHex().length).toBe(58)
		// in eUTXO model we use utxos to manage Value: 
		const aliceUtxos = await network.getUtxos(alice.address);
		// looking through the wallet we find a UTXO with tADA in it:
		expect(aliceUtxos[1].value.dump().lovelace).toBe('50000000')
		
		// validators are other name for Plutus Scripts, smart contracts, etc:
		expect(validatorHash.hex).toBe('f8a07da8d7bed9aa81bc8cb93c462ddec036a84e1fc65dd83076cc2e')
	})

	// TODO: remove bob
	it ("locks tADA at the validator", async ({network, alice, program}) => {
		const optimize = false; // need to add it to the context
		const compiledScript = program.compile(optimize);
		const validatorHash = compiledScript.validatorHash;
		const validatorAddress = Address.fromValidatorHash(validatorHash);

		const adaQty = 10;
		await lockAda(network!, alice!, program, adaQty); 
		expect((await alice.utxos)[0].value.dump().lovelace).toBe('50000000');
		expect((await alice.utxos)[1].value.dump().lovelace).toBe('9758476');
		//TODO: assert value in validator utxo: find tokens locked at the validator
	})
	it ("owner cancels project", async ({network, alice, program}) => {
		const optimize = false; // need to add it to the context
		const compiledScript = program.compile(optimize);
		const validatorHash = compiledScript.validatorHash;
		const validatorAddress = Address.fromValidatorHash(validatorHash);

		const adaQty = 10;
		const duration = 1000000;
		await lockAda(network!, alice!, program, adaQty);
		expect((await alice.utxos)[0].value.dump().lovelace).toBe('50000000');
		expect((await alice.utxos)[1].value.dump().lovelace).toBe('9758476');
		
		await cancelProject(network!, alice!, program );

		const oracle = await alice.utxos;

		// think about which is which.
		expect(oracle[2].value.dump().lovelace).toBe('9558106'); 
		expect(oracle[1].value.dump().lovelace).toBe('10000000');//  
		expect(oracle[0].value.dump().lovelace).toBe('50000000');// collateral?
	})
	it.skip ("adds new code", async ({network, alice, validatorHash}) => {
		expect().toBe();
	})
})
