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

describe('a transaction, redeem ADA locked at a validator', () => {

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
	    inlineDatum
	)
	lock.addOutput(lockTxOutput)

	await lock.finalize(networkParams, alice.address);

	const lockTxId = await network.submitTx(lock);
	network.tick(BigInt(10));

	const redeem = new Tx()
	const redeemIn = await network.getUtxos(validatorAddress)

	// look at a Redeem Tx in Helios examples and Docs; 
	// https://github.com/lley154/helios-examples/blob/704cf0a92cfe252b63ffb9fd36c92ffafc1d91f6/vesting/pages/index.tsx#L328
	// https://www.hyperion-bt.org/helios-book/lang/script-structure.html?highlight=redee#redeemer-3
	// https://www.hyperion-bt.org/helios-book/advanced-concepts/vesting-contract.html?highlight=redeem#redeemer
	// https://www.hyperion-bt.org/helios-book/api/generating.html?highlight=redee#generating-datums-and-redeemers
	// If the script uses the redeemer then a struct or enum must be defined above main that is named Redeemer.
	// so owner-only won't work? or empty list won't work? 
	//
	// What is the Redeemer?
	// Ok, another way is to have it with a Redeemer, like switch to matching-keyhash, and infer data structure by analogy? I tried before, it didn't work; 
	// note: how to search in git commits?
	// A question, can a tx use Redeemer, but the script not use a Redeemer?
	// its seems so:
	// The script can again choose to use or ignore the redeemer during validation.
	// https://www.hyperion-bt.org/helios-book/lang/script-structure.html?highlight=redee#redeemer-3
	// so it should be perfectly normal to send an epmty list in the tx and seek for alternative cause for why tx is getting rejected?

	const redeemer = new ListData([]);
	redeem.addInput(redeemIn[0], redeemer);
	
	redeem.attachScript(compiledProgram);

	const redeemTxOutput = new TxOutput(
	    alice.address,
	    new Value(1000000n), // 1 tAda == 1 million lovelace
	)
	redeem.addOutput(redeemTxOutput);

	// something failed: RuntimeError: Trace: line 149 of IR
	// RuntimeError on line 24 of IR: transaction rejected
	// Why?
	await redeem.finalize(networkParams, alice.address);
	// const redeemTxId = await network.submitTx(redeem);

	network.tick(BigInt(10));

	const utxosFinal = await network.getUtxos(alice.address); 

	// my final result should be in alice wallet, and it should be same type but different value.
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

