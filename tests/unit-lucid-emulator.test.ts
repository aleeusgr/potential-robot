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

import {
  Assets,
  Data,
  Emulator,
  fromText,
  generateSeedPhrase,
  getAddressDetails,
  Lucid,
  SpendingValidator,
  toUnit,
  TxHash,
} from "lucid-cardano"; // NPM

describe('Verbose test', () => {

    async function createEmulator() {

	async function generateAccount(assets: Assets) {
		  const seedPhrase = generateSeedPhrase();
		  return {
		    seedPhrase,
		    address: (await Lucid.new(undefined, "Custom"))
		      .selectWalletFromSeed(seedPhrase).wallet.address(),
		    assets,
		  };
	}
	const wallet1 = generateAccount({ lovelace: 75000000000n });
	const wallet2 = generateAccount({ lovelace: 100000000n });

	const emulator = new Emulator([wallet1, wallet2]);

	const lucid = await Lucid.new(emulator);

	// 
	// lucid.selectWalletFromSeed(wallet1.seedPhrase);

	return lucid

} 

    const main = async () => {
	
	    //how do I access wallets on instantiated emulator? 
	const x = await createEmulator();
	console.log(x);

	try {
	return true
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
	console.log(logMsgs)
	expect(mainStatus).toBe(true);

    })

})

