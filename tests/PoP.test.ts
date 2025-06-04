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

describe("a template", async () => {

	// https://vitest.dev/guide/test-context.html
	beforeEach(async (context) => { 
		let optimize = false;

		// compile the script
		const script = await fs.readFile('./src/PoP.hl', 'utf8'); 
		const program = Program.new(script); 
		const compiledProgram = program.compile(optimize); 
		const validatorHash = compiledProgram.validatorHash;
		const validatorAddress = Address.fromValidatorHash(validatorHash); 
		context.validatorHash = validatorHash;
		context.validatorAddress = Address.fromValidatorHash(validatorHash); 

		// instantiate the Emulator
		const minAda = BigInt(2000000);  // minimum lovelace needed to send an NFT
		const network = new NetworkEmulator();

		// Create and fund wallets
		const scheduler = network.createWallet(BigInt(20000000));
		network.createUtxo(scheduler, BigInt(5000000));
		const bob = network.createWallet(BigInt(10000000));
		network.tick(BigInt(10));

		context.program = program;
		context.scheduler = scheduler;
		context.bob = bob;
		context.network = network;

	})

	it ("asserts properties", async ({network, scheduler, validatorHash}) => {
		const schedulerUtxos = await network.getUtxos(scheduler.address); // https://www.hyperion-bt.org/helios-book/api/reference/address.html?highlight=Address#address
		expect(scheduler.address.toHex().length).toBe(58)
		expect(schedulerUtxos[1].value.dump().lovelace).toBe('5000000')
		expect(validatorHash.hex).toBe('9f43610b85b6c39eca3cdaa7824d289871e4eb2cdea62ac8eba3c7e1')
		// notice how we don't have validatorUtxos yet as we need to first lock a utxo there.
	})

	it ("locks utxo at validator address", async ({network, scheduler, validatorHash, program, bob}) => {
		const adaQty = 10 ;
		const duration = 10000000;
		await lockAda(network!, scheduler!, bob!, program, adaQty, duration)
		const validatorAddress = Address.fromValidatorHash(validatorHash); 
		expect(Object.keys((await network.getUtxos(validatorAddress))[0].value.dump().assets)[0]).toBe('6ecf3e6410cb049736a4d424a439887ad390cf6357ee2f2970a7f235');
	})
})
