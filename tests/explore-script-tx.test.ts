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
				spending vesting

			struct Datum {
			    creator: PubKeyHash
			    beneficiary: PubKeyHash
			    deadline: Time
			}

			enum Redeemer {
			    Cancel
			    Claim
			}

			func main(datum: Datum, redeemer: Redeemer, context: ScriptContext) -> Bool {
			    tx: Tx = context.tx;
			    now: Time = tx.time_range.start;

			    redeemer.switch {
				Cancel => {
				    // Check if deadline hasn't passed
				    (now < datum.deadline).trace("VS1: ") && 

				    // Check that the owner signed the transaction
				    tx.is_signed_by(datum.creator).trace("VS2: ")
				},
				Claim => {
				   // Check if deadline has passed.
				   (now > datum.deadline).trace("VS3: ") &&

				   // Check that the beneficiary signed the transaction.
				   tx.is_signed_by(datum.beneficiary).trace("VS4: ")
				}
			    }
			}
		`).compile().serialize(),
		  ).cborHex,
	};

	const scriptAddress = lucid.utils.validatorToAddress(script);

	const balance = (await lucid.utxosAt(await lucid.wallet.address()))[0]
	console.log(zeroState[0].assets.lovelace - balance.assets.lovelace );

	// 99654456n
	console.log(scriptAddress);
	return balance.assets.lovelace  == 100000000n
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
