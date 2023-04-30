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

	async function generateUAccount(assets: Assets) { 
		// const seedPhrase = await fs.readFile('./tests/seed','utf8');
		const seedPhrase = "order jacket breeze senior wire crunch twin any warrior lonely confirm enrich army foam slice direct defense manual public balcony hunt upon festival club"; 
		  return {
		    seedPhrase,
		    address: (await Lucid.new(undefined, "Custom"))
			// breaks without async, 
		      .selectWalletFromSeed(seedPhrase).wallet.address(),
		    assets,
		  };
	}

	async function generateAccount(assets: Assets) { 
		const seedPhrase = generateSeedPhrase();
		  return {
		    seedPhrase,
		    address: (await Lucid.new(undefined, "Custom"))
			// breaks without async, 
		      .selectWalletFromSeed(seedPhrase).wallet.address(),
		    assets,
		  };
	}
	const wallet1 = generateUAccount({ lovelace: 75000000000n });
	const wallet2 = generateAccount({ lovelace: 100000000n });

	const emulator = new Emulator([wallet1, wallet2]);

	const lucid = await Lucid.new(emulator);

	return lucid

} 

    const main = async () => {
	
	//how do I access wallets on instantiated emulator? 
	    //
	// const lucid = await Lucid.new(
	//   new Blockfrost("https://cardano-preview.blockfrost.io/api/v0", "<projectId>"),
	//   "Preview",
	// );

	try {
		const lucid = await createEmulator();
		lucid.selectWalletFromSeed("order jacket breeze senior wire crunch twin any warrior lonely confirm enrich army foam slice direct defense manual public balcony hunt upon festival club");

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

