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

	const utxosFinal = await network.getUtxos(alice.address); // returns a list!!!
	tx.addInput(utxoIn[0], redeemerData);

	// oh, hsi, totally forgot about the Redeemer. 
	// However, in owner-only there is no redeemer. It uses Datum and script context in its logic...
	// the Redeemer in matching-keyhash is the same as the Datum.
	// so, I can recreate the redeemer for matching-keyhash by copy and paste;
	// Since Datum part of matching-keyhash and vesting is similar, and vesting has owner:PubKeyHash as an element, I can simply delete unnecessary fields and the data structure will match. 

	// 'uplcProgram' is an instance of UplcProgram (i.e. result of helios.Program.new(...).compile(...))
	tx.attachScript(compiledProgram)









	return tx.dump()
	// return utxosFinal[1].value.dump().lovelace == '5000000' && validatorAddress.toBech32() == 'addr_test1wq8jn3u0ts654lp6ltvyju7nflcm5qegukqukuhc4jdxhag7ku5n4'

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

