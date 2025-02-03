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

describe("rewards, bounty and treasury", async () => {
	// Background knowledge on testing Plutus:
	// https://plutus-pioneer-program.readthedocs.io/en/latest/week4.html
	beforeEach(async (context) => { 
		let optimize = false;

		// compile script
		const script = await fs.readFile('./src/treasury.hl', 'utf8'); 
		// TODO: change file to Escrow, implement the Escrow validator
		// Find the Escrow validator here:
		// https://github.com/IntersectMBO/plutus-apps/blob/main/plutus-use-cases/src/Plutus/Contracts/Escrow.hs
		const compiledProgram = Program.new(script).compile(optimize); 
		const validatorHash = compiledProgram.validatorHash;
		const validatorAddress = Address.fromValidatorHash(validatorHash); 
	 
		context.validatorHash = validatorHash;
		context.validatorAddress = Address.fromValidatorHash(validatorHash); 

		// instantiate the Emulator
		const minAda = BigInt(2000000);  // minimum lovelace needed to send an NFT
		const network = new NetworkEmulator();

		const alice = network.createWallet(BigInt(20000000));
		network.createUtxo(alice, BigInt(5000000));
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
		expect(aliceUtxos[1].value.dump().lovelace).toBe('5000000')
		
		// validators are other name for Plutus Scripts, smart contracts, etc:
		expect(validatorHash.hex).toBe('9f43610b85b6c39eca3cdaa7824d289871e4eb2cdea62ac8eba3c7e1')
	})

	it ("locks tADA at the validator", async ({network, alice, validatorHash}) => {
		const adaQty = 10 ;
		const duration = 10000000;
		await lockAda(network!, alice!, bob!, program, adaQty, duration)
		
		// one utxo is unchanged, second has (10 ADA + txFee) less 
		expect((await alice.utxos)[0].value.dump().lovelace).toBe('5000000');
		expect((await network.getUtxos(await alice.address))[0].value.dump().lovelace).toBe('5000000');
		expect((await alice.utxos)[1].value.dump().lovelace).toBe('9756672');

		const validatorAddress = Address.fromValidatorHash(validatorHash); 
		// there exists a utxo that has a specified token locked at a validatorAddress.
		expect(Object.keys((await network.getUtxos(validatorAddress))[0].value.dump().assets)[0]).toBe('6ecf3e6410cb049736a4d424a439887ad390cf6357ee2f2970a7f235');
		// TODO:
		// treasury must belong to someone.
		expect().toBe();
		// alice can lock Value at the validator
		// alice can unlock the Value
		// bob unlocking funds throws error
	})

	it ("adds new code", async ({network, alice, validatorHash}) => {
		expect().toBe();
	})
})
