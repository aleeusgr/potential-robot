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

	// creating validatorAddress
	const script = await fs.readFile('./src/owner-only.hl', 'utf8'); 
	const program = Program.new(script); 
	//space here, maybe I need to modify program using .parameters?
	const compiledProgram = program.compile(optimize); 

	const validatorHash = compiledProgram.validatorHash;
	const validatorAddress = Address.fromValidatorHash(validatorHash); 


	// but now that I need to Redeem, I need another tx, another name:
	const lock = new Tx()
	const ownerPkh = alice.pubKeyHash ;
	const datum = new ListData([new ByteArrayData(ownerPkh.bytes),
				]);

	const inlineDatum = Datum.inline(datum);	
	const hashedDatum = Datum.hashed(datum);	

	const lockIn = await network.getUtxos(alice.address)

	lock.addInput(lockIn[0]);

	const lockTxOutput = new TxOutput(
	    validatorAddress,
	    new Value(1000000n), // 1 tAda == 1 million lovelace
	    hashedDatum
	)
	lock.addOutput(lockTxOutput)

	await lock.finalize(networkParams, alice.address);

	const lockTxId = await network.submitTx(lock);
	network.tick(BigInt(10));

	const redeem = new Tx()
	// https://www.hyperion-bt.org/helios-book/api/building/index.html?highlight=Tx#tx
	// https://www.hyperion-bt.org/helios-book/lang/builtins/tx.html?highlight=Tx#tx
	// https://www.hyperion-bt.org/helios-book/api/reference/tx.html?highlight=Tx#tx
	const redeemIn = await network.getUtxos(validatorAddress)

	const redeemer = new ListData([]);
	redeem.addInput(redeemIn[0], redeemer);
	
	// Error: missing script for input 0
	// https://www.hyperion-bt.org/helios-book/api/reference/tx.html?highlight=Tx#attachscript
	redeem.attachScript(compiledProgram);

	// ok, I see datum in my inputs, thats perfect;
	// Why my tx is being rejected? 
	// I need to add an output

	const redeemTxOutput = new TxOutput(
	    alice.address,
	    new Value(1000000n), // 1 tAda == 1 million lovelace
	)
	redeem.addOutput(redeemTxOutput)
	// await redeem.finalize(networkParams, alice.address);

	// const redeemTxId = await network.submitTx(redeem);
	network.tick(BigInt(10));

	const utxosFinal = await network.getUtxos(alice.address); 

	return redeem.dump().body
//	return (await network.getUtxos(validatorAddress))[0].origOutput.datum.isHashed()

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

