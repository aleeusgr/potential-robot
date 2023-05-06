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
  Constr,
  fromText,
  generateSeedPhrase,
  getAddressDetails,
  Lucid,
  SpendingValidator,
  toUnit,
  TxHash,
} from "lucid-cardano"; // NPM

describe('instantiate the emulator, read and compile Helios script, lock funds in the script address, mint a token; query script address, query user wallet utxo - display minting policy.', () => {

	const main = async () => {

	try {
	// 1. Instantiate the emulator:
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

	const alice = await generateAccount({ lovelace: 75000000000n });
	const bob = await generateAccount({ lovelace: 100000000n });

	const emulator = new Emulator([alice , bob]);

	const lucid = await Lucid.new(emulator);

	// 2. mint nft 
	lucid.selectWalletFromSeed(alice.seedPhrase);
	// should rename or encapsulate this: 
	const { paymentCredential } = lucid.utils.getAddressDetails(await lucid.wallet.address());

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
	const nft = toUnit(policyId, fromText("Collateral"));

	async function mint(): Promise<TxHash> {
		// mint should have nft, mintingPolicy or policyId as an argument?
		// or mint should not be a function at all?
		// what good it does is to encapsulate tx
	  const tx = await lucid.newTx()
	    .mintAssets({
	      [nft]: 1n, //number of tokens minted!
	    })
	    .validTo(emulator.now() + 30000)
	    .attachMintingPolicy(mintingPolicy)
	    .complete();
	  const signedTx = await tx.sign().complete();

	  return signedTx.submit();
	}


	// 3. manipulate the validator
	const script: SpendingValidator = {
		  type: "PlutusV1",
		  script: JSON.parse(
		    Program.new(await fs.readFile('./helios/loan-escrow.js', 'utf8')).compile().serialize(),
		  ).cborHex,
	};

	const scriptAddress = lucid.utils.validatorToAddress(script);

	// Lock funds, populate datum
	async function lockUtxo(lovelace: Lovelace): Promise<TxHash> {
		const { paymentCredential } = lucid.utils.getAddressDetails(await lucid.wallet.address(),);

		const datum = Data.to(
			new Constr(0, [new Constr(0, [paymentCredential?.hash!])]),
		);

		// datum contains data needed for smart contract logic as a indexed list (?)
		const tx = await lucid.newTx().payToContract(scriptAddress, datum, {lovelace,}).complete();

		const signedTx = await tx.sign().complete();

		return signedTx.submit();
	}

	await mint(); //parameters?
	emulator.awaitBlock(4);

	const amt = 2000000n;
	await lockUtxo(amt);
	emulator.awaitBlock(4);
	// TODO: 
	// await CancelLoan();

	//
	// A Redeemer, Datum and UTXOs are all required as part of a
	// transaction when executing a validator script.

	const aliceUtxos = await lucid.utxosAt(alice.address);
	const scriptUtxos = await lucid.utxosAt(scriptAddress);
	return scriptUtxos[0].assets.lovelace == amt 
		&& Object.keys(aliceUtxos[0].assets).includes(nft)
	} catch (err) {
	    console.error("something failed:", err);
	    return false;
	}
	}

	it('implements logging', async () => {

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
