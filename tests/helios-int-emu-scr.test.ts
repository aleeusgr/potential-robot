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

	const utxoIn = await network.getUtxos(alice.address)

	tx.addInput(utxoIn[0]);

	const output = new TxOutput(
	    validatorAddress,
	    new Value(1000000n), // 1 tAda == 1 million lovelace
	    inlineDatum
	)
	tx.addOutput(output)

	await tx.finalize(networkParams, alice.address);

	const txId = await network.submitTx(tx);
	network.tick(BigInt(10));
	const utxosFinal = await network.getUtxos(alice.address); // returns a list!!!

	// but what about my validatorAddress?
	// its of type Address
	// https://www.hyperion-bt.org/helios-book/api/reference/address.html
	// ok, its got type of UTxO
	//
	// https://www.hyperion-bt.org/helios-book/api/reference/utxo.html
	//
	// return (await network.getUtxos(validatorAddress)).txId
	// returned {undefined}
	// ok, 
	// but I need
	// https://www.hyperion-bt.org/helios-book/api/reference/txoutput.html?highlight=txOut#txoutput
	// https://www.hyperion-bt.org/helios-book/lang/builtins/txoutput.html?highlight=txOut#txoutput
	// ok, lovelace
	// but I need Datum
	// https://www.hyperion-bt.org/helios-book/api/reference/datum.html?highlight=inline#inline
	//
	return (await network.getUtxos(validatorAddress))[0].origOutput.datum.isInline()


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

