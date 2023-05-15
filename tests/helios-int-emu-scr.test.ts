import { describe, expect, it, vi } from 'vitest'
import { promises as fs } from 'fs';
import {
  Assets, 
  Address,
  ByteArrayData,
  ConstrData, 
  Datum,
  ListData,
  MintingPolicyHash,
  NetworkEmulator,
  NetworkParams,
  Program, 
  Value, 
  textToBytes,
  TxOutput,
  Tx, 
} from "@hyperionbt/helios";

describe('Submits a transaction to a validator address', () => {

    const main = async () => {

	let optimize = false;
	const minAda = BigInt(2000000);  // minimum lovelace needed to send an NFT
	try {
	const network = new NetworkEmulator();
	const networkParamsFile = await fs.readFile('./src/preprod.json', 'utf8');
	const networkParams = new NetworkParams(JSON.parse(networkParamsFile.toString()));

	const alice = network.createWallet(BigInt(10000000));

	network.createUtxo(alice, BigInt(5000000));

	network.tick(BigInt(10));

	// creating validatorAddress
	const script = await fs.readFile('./src/owner-only.hl', 'utf8'); 
	const program = Program.new(script); 
	//space here, maybe I need to modify program using .parameters?
	const compiledProgram = program.compile(optimize); 

	const validatorHash = compiledProgram.validatorHash;
	const validatorAddress = Address.fromValidatorHash(validatorHash); 
	

	const tx = new Tx()
	const ownerPkh = alice.pubKeyHash ;
	const datum = new ListData([new ByteArrayData(ownerPkh.bytes),
				]);

	const inlineDatum = Datum.inline(datum);	
	const hashedDatum = Datum.hashed(datum);	

	const utxoIn = await network.getUtxos(alice.address)

	tx.addInput(utxoIn[0]);

	const output = new TxOutput(
	    validatorAddress,
	    new Value(1000000n), // 1 tAda == 1 million lovelace
	    hashedDatum
	)
	tx.addOutput(output)

	await tx.finalize(networkParams, alice.address);

	const txId = await network.submitTx(tx);
	network.tick(BigInt(10));
	const utxosFinal = await network.getUtxos(alice.address); // returns a list!!!

	//Ok, here is a new branch point. Owner only will go on with Inline Datum, but I will check out and try hashed Datum here
	//Turns out its rather simple to change

	return (await network.getUtxos(validatorAddress))[0].origOutput.datum.isHashed()


	} catch (err) {
	    console.error("something failed:", err);
	    return false;
	}
    }

    it('adds logging', async () => {

	const logMsgs = new Set();
	const logSpy = vi.spyOn(global.console, 'log')
			 .mockImplementation((msg) => { logMsgs.add(msg); });
	
	let mainStatus = await main();
	logSpy.mockRestore();
	if (!mainStatus) {
	    console.log("Smart Contract Messages: ", logMsgs);
	}
	expect(mainStatus).toBe(true);
	console.log(logMsgs);

    })

})

