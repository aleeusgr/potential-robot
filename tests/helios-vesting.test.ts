import { describe, expect, it, expectTypeOf, beforeEach, vi } from 'vitest'
import { promises as fs } from 'fs';
import {
  Address,
  ByteArrayData,
  Datum,
  IntData,
  ListData,
  NetworkEmulator,
  NetworkParams,
  Program, 
  Value,
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
		network.tick(BigInt(10));

		context.alice = alice;
		context.bob = bob;
		context.network = network;
	})

	it ("checks that a correct script is loaded", async ({programName}) => {
		// https://www.hyperion-bt.org/helios-book/api/reference/program.html	
		expect(programName).toBe('vesting')
	})
	it ("tests NetworkEmulator state", async ({network, alice}) => {
		// https://www.hyperion-bt.org/helios-book/api/reference/address.html?highlight=Address#address
		const aliceUtxos = await network.getUtxos(alice.address);

		expect(alice.address.toHex().length).toBe(58)
		expect(aliceUtxos[1].value.dump().lovelace).toBe('5000000')
	})
	it ("tests lockAda tx", async ({network, alice, bob}) => {
// https://github.com/lley154/helios-examples/blob/704cf0a92cfe252b63ffb9fd36c92ffafc1d91f6/vesting/pages/index.tsx#LL157C1-L280C4
		const benAddr = bob.address;
		const adaQty = 10 ;
		const emulatorDate = 1677108984000; 
		const deadline = new Date(emulatorDate + 10000000);
		const benPkh = bob.pubKeyHash;
		const ownerPkh = alice.pubKeyHash;
		expect(ownerPkh.hex.length).toBe(56);	

		const lovelaceAmt = Number(adaQty) * 1000000;
		const maxTxFee: number = 500000; // maximum estimated transaction fee
		const minChangeAmt: number = 1000000; // minimum lovelace needed to be sent back as change
		const adaAmountVal = new Value(BigInt(lovelaceAmt));
		const minUTXOVal = new Value(BigInt(lovelaceAmt + maxTxFee + minChangeAmt));

		const datum = new ListData([new ByteArrayData(ownerPkh.bytes),
					    new ByteArrayData(benPkh.bytes),
					    new IntData(BigInt(deadline.getTime()))]);

		const inlineDatum = Datum.inline(datum);
	

	})
})
