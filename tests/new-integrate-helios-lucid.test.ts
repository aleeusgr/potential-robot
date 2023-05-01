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
	const zeroState = await lucid.wallet.getUtxos(lucid.wallet.address())
	// https://github.com/spacebudz/lucid/blob/main/src/examples/matching_numbers.ts
	
	const src = `
	spending always_succeeds

	func main(_, _, _) -> Bool {
	    true
	}`
	
	const program = Program.new(src)
	const Uplc = program.compile();	
	const myUplcProgram = JSON.parse(Uplc.serialize());

	const matchingNumberScript: SpendingValidator = {
	  type: "PlutusV1",
	  // script: myUplcProgram.cborHex
	  script: myUplcProgram.cborHex

	};


	const matchingNumberAddress: Address = lucid.utils.validatorToAddress(
	  matchingNumberScript,
	);

	const Datum = (number: number) => Data.to(BigInt(number));
	const Redeemer = (number: number) => Data.to(BigInt(number));

	async function lockUtxo(
	  number: number,
	  lovelace: Lovelace,
	): Promise<TxHash> {
	  const tx = await lucid
	    .newTx()
	    .payToContract(matchingNumberAddress, Datum(number), { lovelace })
	    .complete();

	  const signedTx = await tx.sign().complete();

	  const txHash = await signedTx.submit();

	  return txHash;
	}

	await lockUtxo(1,10000000);
	emulator.awaitBlock(4);
	const utxos = await lucid.wallet.getUtxos(
	  lucid.wallet.address(),
	);

	const difference = zeroState[0].assets.lovelace - utxos[0].assets.lovelace;
	console.log(difference);
	
	return utxos[0].txHash != zeroState
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
