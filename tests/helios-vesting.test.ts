import { describe, expect, it, expectTypeOf, beforeEach, vi } from 'vitest'
import { promises as fs } from 'fs';
import {
  Address,
  NetworkEmulator,
  NetworkParams,
  Program, 
} from "@hyperionbt/helios";

describe("a vesting contract", async () => {

	// https://vitest.dev/guide/test-context.html
	beforeEach(async (context) => { 
		let optimize = false;

		// compile script
		const script = await fs.readFile('./src/vesting.js', 'utf8'); 
		const program = Program.new(script); 
		const compiledProgram = program.compile(optimize); 
		const validatorHash = compiledProgram.validatorHash;
		// https://www.hyperion-bt.org/helios-book/lang/builtins/address.html#address
		const validatorAddress = Address.fromValidatorHash(validatorHash); 
	 
		context.validatorHash = validatorHash;
		context.validatorAddress = Address.fromValidatorHash(validatorHash); 
		context.programName = program.name;

		// instantiate the Emulator
		const minAda = BigInt(2000000);  // minimum lovelace needed to send an NFT
		const network = new NetworkEmulator();

		const alice = network.createWallet(BigInt(20000000));
		network.createUtxo(alice, BigInt(5000000));
		const bob = network.createWallet(BigInt(10000000));
		context.alice = alice;
		context.bob = bob;
		context.network = network;
		network.tick(BigInt(10));

	})

	it ("checks that a correct script is loaded", async ({programName}) => {
		// https://www.hyperion-bt.org/helios-book/api/reference/program.html	
		expect(programName).toBe('vesting')
	})
	it ("tests NetworkEmulator state", async ({network, alice}) => {
		// https://www.hyperion-bt.org/helios-book/api/reference/address.html?highlight=Address#address
		expect(alice.address.toHex().length).toBe(58)
		const aliceUtxos = await network.getUtxos(alice.address);
		expect(aliceUtxos[1].value.dump().lovelace).toBe('5000000')
	})
	it ("tests lockAda tx", async ({network, alice, bob}) => {
	// https://github.com/lley154/helios-examples/blob/704cf0a92cfe252b63ffb9fd36c92ffafc1d91f6/vesting/pages/index.tsx#LL157C1-L280C4
		const benAddr = bob.address;
		const adaQty = 10000000 
		// const dueDate = params[2] as string;
		// const deadline = new Date(dueDate + "T00:00");
	})
})
