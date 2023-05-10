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

describe('Creates Helios Emulator ... ', () => {

    const main = async () => {

	let optimize = false;
	const minAda = BigInt(2000000);  // minimum lovelace needed to send an NFT
	try {

      const network = new NetworkEmulator();

      const alice = network.createWallet(BigInt(10000000));

      network.createUtxo(alice, BigInt(5000000));

      const testAsset = new Assets();
      testAsset.addComponent(
          MintingPolicyHash.fromHex(
          '16aa5486dab6527c4697387736ae449411c03dcd20a3950453e6779c'
          ),
          Array.from(new TextEncoder().encode('Test Asset Name')),
          BigInt(1)
      );

      network.createUtxo(alice, BigInt(2000000), testAsset);

      network.tick(BigInt(10));

      const utxos = await network.getUtxos(alice.address);

      // Pull in the NFT minting script, update params and compile
      const nftScript = await fs.readFile('./src/always-succeeds.hl', 'utf8');
      // https://www.hyperion-bt.org/helios-book/api/reference/program.html?highlight=Program#program
      const nftProgram = Program.new(nftScript);
      // nftProgram.parameters = {["TX_ID"] : utxos[0].txId.hex};
      // nftProgram.parameters = {["TX_IDX"] : utxos[0].utxoIdx};
      const nftCompiledProgram = nftProgram.compile(optimize);
      // https://www.hyperion-bt.org/helios-book/api/reference/uplcprogram.html
      const nftMPH = nftCompiledProgram.validatorHash;

      console.log(nftMPH.paramTypes);
      // // Start building the transaction
      // const tx = new Tx();

      // // Add the UTXO as inputs
      // tx.addInputs(utxos);

      // // Add the script as a witness to the transaction
      // tx.attachScript(nftCompiledProgram);

      // // Create an empty Redeemer because we must always send a Redeemer with
      // // a plutus script transaction even if we don't actually use it.
      // const nftRedeemer = new ConstrData(0, []);
      // const token = [[textToBytes("Thread Token"), BigInt(1)]];
      // 
      // // Add the mint to the tx
      // tx.mintTokens(
      //     nftMPH,
      //     token,
      //     nftRedeemer
      // )

      // // Attach the output with the minted nft to the destination address
      // tx.addOutput(new TxOutput(
      //     alice.address,
      //     new Value(minAda, new Assets([[nftMPH, token]]))
      //   ));

      //   // Network Parameters
      // const networkParamsFile = await fs.readFile('./src/preprod.json', 'utf8');
      // const networkParams = new NetworkParams(JSON.parse(networkParamsFile.toString()));

      // await tx.finalize(networkParams, alice.address, utxos);
      // const txId = await network.submitTx(tx);

      // // Tick the network on 10 more slots,
      // network.tick(BigInt(10));

      const utxosFinal = await network.getUtxos(alice.address);
      console.log(utxosFinal[2].value.dump().assets);
      //  '16aa5486dab6527c4697387736ae449411c03dcd20a3950453e6779c': { '54657374204173736574204e616d65': '1' }

	return utxosFinal[2].value.dump().assets !=1
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

