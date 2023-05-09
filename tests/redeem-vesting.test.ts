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

describe('', () => {

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

	const alice = await generateAccount({ lovelace: 75000000000n });
	const bob = await generateAccount({ lovelace: 100000000n });

	const emulator = new Emulator([alice , bob]);

	const lucid = await Lucid.new(emulator);

	// emulator state changes, how do I encapsulate this?
	lucid.selectWalletFromSeed(bob.seedPhrase);
	// const zeroState = await lucid.wallet.getUtxos(lucid.wallet.address())

	const script: SpendingValidator = {
		  type: "PlutusV1",
		  script: JSON.parse(
		    Program.new(await fs.readFile('./src/vesting.js', 'utf8')).compile().serialize(),
		  ).cborHex,
	};

	const scriptAddress = lucid.utils.validatorToAddress(script);

	// The validator scripts currently have a type
	// Redeemer -> DataValue -> ScriptContext -> a -> ()
	
	async function lockUtxo(lovelace: Lovelace): Promise<TxHash> {
		const { paymentCredential } = lucid.utils.getAddressDetails(await lucid.wallet.address(),);

		// This represents the Datum struct from the Helios on-chain code
		// loan:
		// struct Datum {
		//     ?lender: PubKeyHash
		//     ?borrower: PubKeyHash
		//     collateral: policy id
		//     deadline: 
		// }
		//
		// vesting:
		// struct Datum {
		//     creator: PubKeyHash
		//     beneficiary: PubKeyHash
		//     deadline: Time
		// }
		//
		// my datum now is for matching_keyhash!!!
		// struct Datum {
		//     owner: PubKeyHash
		// }
		const datum = Data.to(
			new Constr(0, [new Constr(0, [paymentCredential?.hash!])]),
		);

		console.log(datum);
		// datum contains data needed for smart contract logic as a indexed list (?)
		const tx = await lucid.newTx().payToContract(scriptAddress, datum, {lovelace,}).complete();

		const signedTx = await tx.sign().complete();

		return signedTx.submit();
	}
	
	async function redeemUtxo(): Promise<TxHash> {
		const { paymentCredential } = lucid.utils.getAddressDetails(
			await lucid.wallet.address(),
		);

		const redeemer = Data.to(
			new Constr(0, [new Constr(0, [paymentCredential?.hash!])]),
		);

		const datumHash = lucid.utils.datumToHash(redeemer);

		const utxos = await lucid.utxosAt(scriptAddress);

		const utxo = utxos.find((utxo) => utxo.datumHash === datumHash);

		if (!utxo) throw new Error("UTxO not found.");

		const tx = await lucid.newTx().collectFrom([utxo], redeemer)
			.attachSpendingValidator(script)
			.complete();

		const signedTx = await tx.sign().complete();

		return signedTx.submit();
	}

	await lockUtxo(2000000);
	emulator.awaitBlock(4);

	await redeemUtxo(2000000);
	emulator.awaitBlock(4);
	// A Redeemer, Datum and UTXOs are all required as part of a
	// transaction when executing a validator smart contract script.
	const cb = await lucid.utxosAt(scriptAddress);
	return cb[0].assets.lovelace == 2000000n
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
