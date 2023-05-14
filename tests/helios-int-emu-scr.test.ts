import { describe, expect, it, vi } from 'vitest'
import { promises as fs } from 'fs';
import {
  Assets, 
  Address,
  ConstrData, 
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

      // Now we are able to get the UTxOs in Alices wallet

	const script = await fs.readFile('./src/owner-only.hl', 'utf8'); 
	const program = Program.new(script); 
	const compiledProgram = program.compile(optimize); 

	const validatorHash = compiledProgram.validatorHash;
	// https://www.hyperion-bt.org/helios-book/lang/builtins/address.html#address
	const validatorAddress = Address.fromValidatorHash(validatorHash); 
	
	// Building tx
	// function (source, Value);
	
	const tx = new Tx()
	const utxoIn = await network.getUtxos(alice.address)

	tx.addInput(utxoIn[0]);

	const output = new TxOutput(
	    validatorAddress,
	    new Value(1000000n), // 1 tAda == 1 million lovelace
	    // so here I need a Datum, probably
	)
	tx.addOutput(output)
	

	await tx.finalize(networkParams, alice.address);

	const txId = await network.submitTx(tx);
	network.tick(BigInt(10));
	const utxosFinal = await network.getUtxos(alice.address); // returns a list!!!

	// ok, so far tx builder calculates fee and sends the rest of the tx back to alice;
	// - [ ] add someone else, in my case - validatorAddress, as a recipient. 
	// validatorAddress won't change unless I change L36;
	// 
	//
	
	return Object.keys(tx.dump().body)
	// return validatorAddress.toBech32() == 'addr_test1wq8jn3u0ts654lp6ltvyju7nflcm5qegukqukuhc4jdxhag7ku5n4' 

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

