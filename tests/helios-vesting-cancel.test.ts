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

	it ("docs the tx ingridients", async ({network, alice, validatorHash}) => {
		// https://www.hyperion-bt.org/helios-book/api/reference/address.html?highlight=Address#address
		const aliceUtxos = await network.getUtxos(alice.address);
		// todo
		expect(alice.address.toHex().length).toBe(58)
		// todo
		expect(aliceUtxos[1].value.dump().lovelace).toBe('5000000')
		// todo
		expect(validatorHash.hex).toBe('0502e977b1b2d1be41edabd19401d65d43f1d936f82297b72c71663c')
	})

	it ("adds new code", async ({network, alice, bob, validatorHash}) => {
		const adaQty = 10;
		const duration = 10000000;
		await lockAda(network!, alice!, bob!, validatorHash, adaQty, duration)
		expect((await alice.utxos)[0].value.dump().lovelace).toBe('14747752');
		const keyMPH = '49b106e698de78171de2faf35932635e1085c12508ca87718a2d4487'
		// building Cancel tx
		expect(keyMPH).toBe('49b106e698de78171de2faf35932635e1085c12508ca87718a2d4487');


	})
})
