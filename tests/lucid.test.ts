import { describe, expect, it, beforeEach, expectTypeOf, vi } from 'vitest'
import { promises as fs } from 'fs';
import {

} from "@hyperionbt/helios";

import {
  Assets,
  Data,
  Emulator,
  fromText,
  generateSeedPhrase,
  getAddressDetails,
  Lucid,
  TxHash,
} from "lucid-cardano"; // NPM

describe('TestSuite: ', () => {
	// single test, 
	// it checks the status of the main function, while the main() takes care of logging and IO;
	// API methods:
	// set up the emulator;
	// execute a transaction;
	// Is there a way to add nft into a wallet in the emulate without using minting script?
	// If not, I need to add a code block that will output a uplc consumable by the transaction builder.
	// I need to find a method or code example in lucid that will show a transaction with a uplc involved
	//

    beforeEach(async () => {

	// Set the Helios compiler optimizer flag
        let optimize = false;
        const minAda = BigInt(2000000);  // minimum lovelace needed to send an NFT
	
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

	const lucid = Lucid.new(emulator);
	
	//what's this?
	// lucid.selectWalletFromSeed(lender.seedPhrase);
	// const recipient = "addr_test1qrupyvhe20s0hxcusrzlwp868c985dl8ukyr44gfvpqg4ek3vp92wfpentxz4f853t70plkp3vvkzggjxknd93v59uysvc54h7";

	// const datum = Data.to(123n);
	// const lovelace = 3000000n;

	// const tx = await lucid.newTx().payToAddressWithData(recipient, {
	//   inline: datum,
	// }, { lovelace }).complete();

	// const signedTx = await tx.sign().complete();
	// const txHash = await signedTx.submit();
	// await lucid.awaitTx(txHash);

	// const utxos = await lucid.utxosAt(
	//   recipient,
	// );
        // return true;
        // const walletLovelace = parseInt(utxos[0].assets.lovelace)
	return lucid
    })

    it(' ', async () => {

        // const logMsgs = new Set();
        // const logSpy = vi.spyOn(global.console, 'log')
        //                  .mockImplementation((msg) => { logMsgs.add(msg); });
        // 
        // let mainStatus = await main();
        // logSpy.mockRestore();
        // if (!mainStatus) {
        //     console.log("Smart Contract Messages: ", logMsgs);
        // }
        // expect(mainStatus).toBe(true);

	expect(lucid).toBe(true)
    })

})
