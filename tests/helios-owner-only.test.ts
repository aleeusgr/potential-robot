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

	const script = await fs.readFile('./src/always-succeeds.hl', 'utf8'); 
	const program = Program.new(script); 
	const compiledProgram = program.compile(optimize); 

	const validatorHash = compiledProgram.validatorHash;
	// https://www.hyperion-bt.org/helios-book/lang/builtins/address.html#address
	const validatorAddress = Address.fromValidatorHash(validatorHash); 
	

      const utxosFinal = await network.getUtxos(alice.address);

	// return utxosFinal[1].value.dump().lovelace == '5000000' && validatorHash.hex == '0f29c78f5c354afc3afad84973d34ff1ba0328e581cb72f8ac9a6bf5'
      return validatorAddress

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

