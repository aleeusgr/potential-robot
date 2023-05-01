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

	// emulator state changes, how do I encapsulate this?
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
	async function mint(): Promise<TxHash> {
	// this function is not pure: time, mintingPolicy, policyId change outside of the scope.
	  const tx = await lucid.newTx()
	    .mintAssets({
	      [toUnit(policyId, fromText("Collateral"))]: 1n,
	    })
	    .validTo(emulator.now() + 30000)
	    .attachMintingPolicy(mintingPolicy)
	    .complete();
	  const signedTx = await tx.sign().complete();

	  return signedTx.submit();
	}


	await mint();

	emulator.awaitBlock(4);
	//                  lucid.wallet.getUtxos()
	const utxos = await lucid.utxosAt(
	  recipient,
	);
	console.log(utxos[0].assets);

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
