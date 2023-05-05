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

describe('introduces Helios, a source of a new template', () => {

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
	
	// import and compile a Helios contract.
	const src = await fs.readFile('./helios/always-succeeds.js', 'utf8');
	const program = Program.new(src)
	const Uplc = program.compile();	
	const myUplcProgram = JSON.parse(Uplc.serialize());

	const alwaysSucceedsScript: SpendingValidator = {
	  type: "PlutusV2",
	  // type: myUplcProgram.type,
	  script: myUplcProgram.cborHex

	};

	const alwaysSucceedsAddress: Address = lucid.utils.validatorToAddress(
	  alwaysSucceedsScript,
	);

	const Datum = (number: number) => Data.to(BigInt(number));
	const Redeemer = (number: number) => Data.to(BigInt(number));

	async function lockUtxo(
	  number: number,
	  lovelace: Lovelace,
	): Promise<TxHash> {
	  const tx = await lucid
	    .newTx()
	    .payToContract(alwaysSucceedsAddress, Datum(number), { lovelace })
	    .complete();

	  const signedTx = await tx.sign().complete();

	  const txHash = await signedTx.submit();

	  return txHash;
	}

	async function redeemUtxo(number: number): Promise<TxHash> {
		const utxo = (await lucid.utxosAt(alwaysSucceedsAddress)).slice(-1)[0];

		const tx = await lucid
		.newTx()
		.collectFrom([utxo], Redeemer(number))
		.attachSpendingValidator(alwaysSucceedsScript)
		.complete();

		const signedTx = await tx.sign().complete();

		const txHash = await signedTx.submit();

		return txHash;
	}

	await lockUtxo(123,100000); 
	emulator.awaitBlock(4);

	console.log((await lucid.utxosAt(await lucid.wallet.address()))[0]);
	console.log((await lucid.utxosAt(alwaysSucceedsAddress))[0]);

	await redeemUtxo(1);
	emulator.awaitBlock(4);
	// what is my oracle?
	// - [x] wallet balance
	//
	console.log((await lucid.utxosAt(alice.address))[0]);
	console.log((await lucid.utxosAt(alwaysSucceedsAddress))[0]);

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
