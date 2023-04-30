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

	return await Lucid.new(emulator);
 

} 

    const main = async () => {
	
	try {
		const lucid = await createEmulator();
		lucid.selectWalletFromSeed("order jacket breeze senior wire crunch twin any warrior lonely confirm enrich army foam slice direct defense manual public balcony hunt upon festival club");
		const recipient = await lucid.wallet.address();
		const { paymentCredential } = lucid.utils.getAddressDetails( recipient );

		const mintingPolicy: MintingPolicy = lucid.utils.nativeScriptFromJson(
			  {
			    type: "all",
			    scripts: [
			      { type: "sig", keyHash: paymentCredential?.hash! },
			      {
				type: "before",
				slot: lucid.utils.unixTimeToSlot(Date.now() + 1000000),
			      },
			    ],
			  },
		);


		const datum = Data.to(123n);
		const lovelace = 3000000n;

		console.log(mintingPolicy);
		console.log(recipient);
		const tx = await lucid.newTx().payToAddressWithData(recipient, {
		  inline: datum,
		}, { lovelace }).complete();

		const signedTx = await tx.sign().complete();
		const txHash = await signedTx.submit();
		await lucid.awaitTx(txHash);

		const utxos = await lucid.utxosAt(
		  recipient,
		);
		// return parseInt(utxos[0].assets.lovelace) == 3000000
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
	// console.log(logMsgs)
	expect(mainStatus).toBe(true);

    })

})

