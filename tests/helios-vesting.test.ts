import { describe, expect, it, expectTypeOf, beforeEach, vi } from 'vitest'
import { promises as fs } from 'fs';
import {
  Address,
  Assets,
  ByteArrayData,
  ConstrData,
  Datum,
  hexToBytes,
  IntData,
  ListData,
  NetworkEmulator,
  NetworkParams,
  Program, 
  Tx,
  TxOutput,
  Value,
} from "@hyperionbt/helios";
import {lockAda} from './src/lockAda.ts';

describe("a vesting contract", async () => {

	// https://vitest.dev/guide/test-context.html
	beforeEach(async (context) => { 
		let optimize = false;

		// compile script
		const script = await fs.readFile('./src/vesting.js', 'utf8'); 
		const program = Program.new(script); 
		const compiledProgram = program.compile(optimize); 
		const validatorHash = compiledProgram.validatorHash;
		const validatorAddress = Address.fromValidatorHash(validatorHash); 
	 
		context.validatorHash = validatorHash;
		context.validatorAddress = Address.fromValidatorHash(validatorHash); 
		context.programName = program.name;

		// instantiate the Emulator
		const minAda = BigInt(2000000);  // minimum lovelace needed to send an NFT
		const network = new NetworkEmulator();

		const alice = network.createWallet(BigInt(20000000));
		network.createUtxo(alice, BigInt(5000000));
		const bob = network.createWallet(BigInt(10000000));
		network.tick(BigInt(10));

		context.alice = alice;
		context.bob = bob;
		context.network = network;
	})

	it ("checks that a correct script is loaded", async ({programName}) => {
		// https://www.hyperion-bt.org/helios-book/api/reference/program.html	
		expect(programName).toBe('vesting')
	})
	it ("tests NetworkEmulator state", async ({network, alice}) => {
		// https://www.hyperion-bt.org/helios-book/api/reference/address.html?highlight=Address#address
		const aliceUtxos = await network.getUtxos(alice.address);

		expect(alice.address.toHex().length).toBe(58)
		expect(aliceUtxos[1].value.dump().lovelace).toBe('5000000')
	})
	it ("tests lockAda tx", async ({network, alice, bob, validatorAddress}) => {
// https://github.com/lley154/helios-examples/blob/704cf0a92cfe252b63ffb9fd36c92ffafc1d91f6/vesting/pages/index.tsx#LL157C1-L280C4
		const benAddr = bob.address;
		const adaQty = 10 ;
		const duration = 10000000;

		const emulatorDate = 1677108984000; 
		const deadline = new Date(emulatorDate + duration);
		const benPkh = bob.pubKeyHash;
		const ownerPkh = alice.pubKeyHash;

		const lovelaceAmt = Number(adaQty) * 1000000;
		const adaAmountVal = new Value(BigInt(lovelaceAmt));

		const datum = new ListData([new ByteArrayData(ownerPkh.bytes),
					    new ByteArrayData(benPkh.bytes),
					    new IntData(BigInt(deadline.getTime()))]);
		const inlineDatum = Datum.inline(datum);

		const inputUtxos = await alice.utxos;

		const tx = new Tx();

		tx.addInputs(inputUtxos);

		const mintScript =`minting nft

		const TX_ID: ByteArray = #` + inputUtxos[0].txId.hex + `
		const txId: TxId = TxId::new(TX_ID)
		const outputId: TxOutputId = TxOutputId::new(txId, ` + inputUtxos[0].utxoIdx + `)

		func main(ctx: ScriptContext) -> Bool {
			tx: Tx = ctx.tx;
			mph: MintingPolicyHash = ctx.get_current_minting_policy_hash();

			assetclass: AssetClass = AssetClass::new(
			mph,
			"Vesting Key".encode_utf8()
			);
			value_minted: Value = tx.minted;

			// Validator logic starts
			(value_minted == Value::new(assetclass, 1)).trace("NFT1: ") &&
			tx.inputs.any((input: TxInput) -> Bool {
						(input.output_id == outputId).trace("NFT2: ")
						}
			)
		}`

		const optimize = false; //maybe add to test context?
		const mintProgram = Program.new(mintScript).compile(optimize);

		tx.attachScript(mintProgram);

		// Construct the NFT that we will want to send as an output
		const nftTokenName = ByteArrayData.fromString("Vesting Key").toHex();
		const tokens: [number[], bigint][] = [[hexToBytes(nftTokenName), BigInt(1)]];

		// Create an empty Redeemer because we must always send a Redeemer with
		// a plutus script transaction even if we don't actually use it.
		const mintRedeemer = new ConstrData(0, []);

		// Indicate the minting we want to include as part of this transaction
		tx.mintTokens(
			mintProgram.mintingPolicyHash,
			tokens,
			mintRedeemer
		)

		const lockedVal = new Value(adaAmountVal.lovelace, new Assets([[mintProgram.mintingPolicyHash, tokens]]));
		
		// Add the destination address and the amount of Ada to lock including a datum
		tx.addOutput(new TxOutput(validatorAddress, lockedVal, inlineDatum));

		// beforeAll?
		const networkParamsFile = await fs.readFile('./src/preprod.json', 'utf8');
		const networkParams = new NetworkParams(JSON.parse(networkParamsFile.toString()));

		await tx.finalize(networkParams, alice.address);
		const txId = await network.submitTx(tx);

		network.tick(BigInt(10));

		//alice utxos changed
		expect((await alice.utxos)[0].value.dump().lovelace).toBe('14747752');
		
		// validator address holds Vesting Key
		expect(Object.keys((await network.getUtxos(validatorAddress))[0].value.dump().assets)[0]).toEqual(mintProgram.mintingPolicyHash.hex);

	})

	it ("tests lockAda tx import", async ({network, alice, bob, validatorAddress}) => {
// https://github.com/lley154/helios-examples/blob/704cf0a92cfe252b63ffb9fd36c92ffafc1d91f6/vesting/pages/index.tsx#LL157C1-L280C4
		const adaQty = 10 ;
		const duration = 10000000;
		await lockAda(alice, bob, adaQty, duration)
	})
})
