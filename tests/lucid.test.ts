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

    const main = async () => {

	// Set the Helios compiler optimizer flag
        let optimize = false;
        const minAda = BigInt(2000000);  // minimum lovelace needed to send an NFT

        try {
	// https://github.com/spacebudz/lucid/blob/main/tests/emulator.test.ts
	async function generateAccount(assets: Assets) {
	  const seedPhrase = generateSeedPhrase();
	  return {
	    seedPhrase,
	    address: await (await Lucid.new(undefined, "Custom"))
	      .selectWalletFromSeed(seedPhrase).wallet.address(),
	    assets,
	  };
	}

	const lender = await generateAccount({ lovelace: 75000000000n });
	const borrower = await generateAccount({ lovelace: 100000000n });

	const emulator = new Emulator([lender, borrower]);

	const lucid = await Lucid.new(emulator);

	// emulator state changes:
	lucid.selectWalletFromSeed(borrower.seedPhrase);
	
	// https://lucid.spacebudz.io/docs/getting-started/mint-assets/
	const recipient = await lucid.wallet.address();
	const { paymentCredential } = lucid.utils.getAddressDetails( recipient );

	const txTime = emulator.now();
	const mintingPolicy = lucid.utils.nativeScriptFromJson(
	  {
	    type: "all",
	    scripts: [
	      { type: "sig", keyHash: paymentCredential.hash },
	      {
		type: "before",
		slot: lucid.utils.unixTimeToSlot(txTime + 1000000),
	      },
	    ],
	  },
	);

	const policyId = lucid.utils.mintingPolicyToId(mintingPolicy);
	const unit = policyId + fromText("nft");

	const mintTx = await lucid.newTx()
	     .mintAssets({ [unit]: 1n })
	     .validTo(txTime + 200000)
	     .attachMintingPolicy(mintingPolicy)
	     .complete();

	const signedMintTx = await mintTx.sign().complete();
	const mintTxHash = await signedMintTx.submit();
	//                  lucid.wallet.getUtxos()
	const utxos = await lucid.utxosAt(
	  recipient,
	  //lender.address,
	  //borrower.address,
	);

	console.log(utxos);

//	console.log(signedMintTx);
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
