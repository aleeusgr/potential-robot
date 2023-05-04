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
	const zeroState = await lucid.wallet.getUtxos(lucid.wallet.address())
	// https://github.com/spacebudz/lucid/blob/main/src/examples/matching_numbers.ts
	// https://github.com/spacebudz/lucid/blob/main/src/examples/matching_keyhash.ts	
	// import and compile a Helios contract.
	// The validator scripts currently have a type
	// Redeemer -> DataValue -> ScriptContext -> a -> ()


	const script: SpendingValidator = {
		  type: "PlutusV1",
		  script: JSON.parse(
		    Program.new(`
		    spending matching_pubKeyHash

		    struct Datum {
			owner: PubKeyHash
		    }

		    struct Redeemer {
			owner: PubKeyHash
		    }

		    func main(datum : Datum, redeemer: Redeemer) -> Bool {datum.owner == redeemer.owner}
		`).compile().serialize(),
		  ).cborHex,
	};

	const scriptAddress = lucid.utils.validatorToAddress(script);
	async function lockUtxo(lovelace: Lovelace): Promise<TxHash> {
	  const { paymentCredential } = lucid.utils.getAddressDetails(
	    await lucid.wallet.address(),
	  );

	  // This represents the Datum struct from the Helios on-chain code
	  const datum = Data.to(
	    new Constr(0, [new Constr(0, [paymentCredential?.hash!])]),
	  );

	  const tx = await lucid.newTx().payToContract(scriptAddress, datum, {
	    lovelace,
	  })
	    .complete();

	  const signedTx = await tx.sign().complete();

	  return signedTx.submit();
	}

	async function redeemUtxo(): Promise<TxHash> {
	  const { paymentCredential } = lucid.utils.getAddressDetails(
	    await lucid.wallet.address(),
	  );

	  // This represents the Redeemer struct from the Helios on-chain code
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

	const balance = (await lucid.utxosAt(await lucid.wallet.address()))[0]
	console.log(zeroState[0].assets.lovelace - balance.assets.lovelace );

	// 99654456n
	return balance.assets.lovelace == 99654456n
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

	})

	})
