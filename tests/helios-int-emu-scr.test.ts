import { describe, expect, it, vi } from 'vitest'
import { promises as fs } from 'fs';
import {
  Assets, 
  Address,
  ByteArrayData,
  ConstrData, 
  Datum,
  ListData,
  MintingPolicyHash,
  NetworkEmulator,
  NetworkParams,
  Program, 
  Value, 
  textToBytes,
  TxOutput,
  Tx, 
} from "@hyperionbt/helios";

describe('Submits a transaction to a validator address', () => {

    const main = async () => {

	let optimize = false;
	const minAda = BigInt(2000000);  // minimum lovelace needed to send an NFT
	try {
	const network = new NetworkEmulator();
	const networkParamsFile = await fs.readFile('./src/preprod.json', 'utf8');
	const networkParams = new NetworkParams(JSON.parse(networkParamsFile.toString()));

	const alice = network.createWallet(BigInt(10000000));

	network.createUtxo(alice, BigInt(5000000));

	network.tick(BigInt(10));

      // Now we are able to get the UTxOs in Alices wallet

	const script = await fs.readFile('./src/owner-only.hl', 'utf8'); 
	const program = Program.new(script); 
	const compiledProgram = program.compile(optimize); 

	const validatorHash = compiledProgram.validatorHash;
	// https://www.hyperion-bt.org/helios-book/lang/builtins/address.html#address
	const validatorAddress = Address.fromValidatorHash(validatorHash); 
	
	// Building tx
	// function (source, Value);
	// Construct the datum https://github.com/lley154/helios-examples/blob/main/vesting/pages/index.tsx#L194-L199
	// I need alice pubkeyhash;
	// alice is of type WalletEmulator
	// Datum is inline. What does it mean?
	
	const ownerPkh = alice.pubKeyHash ;
	const datum = new ListData([new ByteArrayData(ownerPkh.bytes),
				//  new ByteArrayData(benPkh.bytes),
				//  new IntData(BigInt(deadline.getTime()))
				]);

	const inlineDatum = Datum.inline(datum);	

	const tx = new Tx()
	const utxoIn = await network.getUtxos(alice.address)

	tx.addInput(utxoIn[0]);

	const output = new TxOutput(
	    validatorAddress,
	    new Value(1000000n), // 1 tAda == 1 million lovelace
	    inlineDatum
	)
	tx.addOutput(output)

	await tx.finalize(networkParams, alice.address);

	const txId = await network.submitTx(tx);
	network.tick(BigInt(10));
	const utxosFinal = await network.getUtxos(alice.address); // returns a list!!!

	return tx.dump().body.outputs[0].value.lovelace == '1025780' && tx.dump().body.outputs[0].datum.inlineCbor == '9f581c95d3c44f6d118c911748e400f41c524a7cb2c706a0e96558a35a0df7ff'


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

