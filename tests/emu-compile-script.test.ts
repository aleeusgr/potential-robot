import { describe, expect, it, vi } from 'vitest'
import { promises as fs } from 'fs';
import {
  Assets, 
  Address,
  ByteArrayData,
  ConstrData, 
  Datum,
  ListData,
  IntData,
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
	const networkParamsFile = await fs.readFile('./src/preprod.json', 'utf8');
	const networkParams = new NetworkParams(JSON.parse(networkParamsFile.toString()));

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

	// Pull in a script, and compile;
	const script = await fs.readFile('./src/always-succeeds.hl', 'utf8');
	// https://www.hyperion-bt.org/helios-book/api/reference/program.html?highlight=Program#program
	const scriptProgram = Program.new(script);
	const scriptCompiledProgram = scriptProgram.compile(optimize);
	// https://www.hyperion-bt.org/helios-book/api/reference/uplcprogram.html
	const scriptValidatorHash = scriptCompiledProgram.validatorHash;
	const validatorAddress = Address.fromValidatorHash(scriptValidatorHash);

	const lockADA = new Tx();

	// https://github.com/lley154/helios-examples/blob/704cf0a92cfe252b63ffb9fd36c92ffafc1d91f6/vesting/pages/index.tsx#L195-L199
	const datum = new ListData([new ByteArrayData(alice.pubKeyHash.bytes),
                                  //new ByteArrayData(benPkh.bytes),
                                  // new IntData(BigInt(deadline.getTime()))
				]);

	const inlineDatum = Datum.inline(datum);

	lockADA.addInputs(utxos);

	// lockADA.attachScript(scriptCompiledProgram);

	lockADA.addOutput(new TxOutput(
		// alice.address, 
		validatorAddress,
		new Value(BigInt(10000000)),
		inlineDatum
	));


	// change address!! alice.address?
	await lockADA.finalize(networkParams, alice.address, utxos);
	const lockADAid = await network.submitTx(lockADA);

	network.tick(BigInt(10));

	// //now redeem:
	const utxosR = await network.getUtxos(validatorAddress);
	const redeemADA = new Tx();

	// see Redeemer in lucid examples?
	const valRedeemer = new ConstrData(1, []);

	redeemADA.attachScript(scriptCompiledProgram);
	// https://github.com/lley154/helios-examples/blob/704cf0a92cfe252b63ffb9fd36c92ffafc1d91f6/vesting/pages/index.tsx#L255
	// the order matters?
	redeemADA.addInputs(utxosR, valRedeemer);


	redeemADA.addOutput(new TxOutput(
		alice.address,
		new Value(BigInt(10000000))
	));

	// // alice.address here? ---------------------v
	await redeemADA.finalize(networkParams, validatorAddress, utxos);
	// const redeemADAid = await network.submitTx(redeemADA);
	// network.tick(BigInt(10));

	const utxosFinal = await network.getUtxos(alice.address);
	console.log(utxos);

	return utxosFinal[0].value.dump().lovelace == '1064570'
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

