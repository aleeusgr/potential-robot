import { describe, expect, it, vi } from 'vitest'
import { promises as fs } from 'fs';
import {
  Assets, 
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

describe('Creates Helios Emulator and adds an nft to a wallet', () => {

    const main = async () => {

	let optimize = false;
	const minAda = BigInt(2000000);  // minimum lovelace needed to send an NFT
	try {
	// Create an Instance of NetworkEmulator
      const network = new NetworkEmulator();

      // Create a Wallet - we add 10ADA to start
      const alice = network.createWallet(BigInt(10000000));

      // Add an additional lovelace only UTXO
      network.createUtxo(alice, BigInt(5000000));

      // Now lets tick the network on 10 slots,
      // this will allow the UTxOs to be created from Genisis
      network.tick(BigInt(10));

      // Now we are able to get the UTxOs in Alices wallet

      const utxosFinal = await network.getUtxos(alice.address);

	return utxosFinal[1].value.dump().lovelace == '5000000'
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

