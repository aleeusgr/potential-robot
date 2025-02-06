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

// https://github.com/lley154/helios-examples/blob/704cf0a92cfe252b63ffb9fd36c92ffafc1d91f6/vesting/pages/index.tsx#LL157C1-L280C4
export const lockAda = async (
		network: NetworkEmulator,
		alice : WalletEmulator,
		program: Program,
		adaQty : number
		) => {
	
	const optimize = false; // isnt there a way to set it globally?
	const compiledScript = program.compile(optimize);
	const validatorHash = compiledScript.validatorHash;
	const validatorAddress = Address.fromValidatorHash(validatorHash); 

	const networkParamsFile = await fs.readFile('./src/preprod.json', 'utf8');
	const networkParams = new NetworkParams(JSON.parse(networkParamsFile.toString()));

	const ownerPkh = alice.pubKeyHash;

	const lovelaceAmt = Number(adaQty) * 1000000;
	const adaAmountVal = new Value(BigInt(lovelaceAmt));

	const datum = new ByteArrayData(ownerPkh.bytes);
	const inlineDatum = Datum.inline(datum);

	const inputUtxos = await alice.utxos;

	// TODO: remove
	const mintScript =`minting nft

	enum Redeemer {
		Init
	}

	const TX_ID: ByteArray = #` + inputUtxos[0].txId.hex + `
	const txId: TxId = TxId::new(TX_ID)
	const outputId: TxOutputId = TxOutputId::new(txId, ` + inputUtxos[0].utxoIdx + `)

	func main(_, ctx: ScriptContext) -> Bool {
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

	const mintProgram = Program.new(mintScript).compile(optimize);

	// Construct the NFT that we will want to send as an output
	const nftTokenName = ByteArrayData.fromString("Vesting Key").toHex();
	const tokens: [number[], bigint][] = [[hexToBytes(nftTokenName), BigInt(1)]];

	// Create an empty Redeemer because we must always send a Redeemer with
	// a plutus script transaction even if we don't actually use it.
	const mintRedeemer = new ConstrData(0, []);

	const lockedVal = new Value(adaAmountVal.lovelace, new Assets([[mintProgram.mintingPolicyHash, tokens]]));
	const tx = new Tx()
		.addInputs([inputUtxos[0]])
		.attachScript(mintProgram)
		// Indicate the minting we want to include as part of this transaction
		// TODO: remove
		.mintTokens(
			mintProgram.mintingPolicyHash,
			tokens,
			mintRedeemer
		)
		// Add the destination address and the amount of Ada to lock including a datum
		.addOutput(new TxOutput(validatorAddress, lockedVal, inlineDatum));


	// TODO: it looks like it would fit in the test workflow, why did we add it here?
	// clarify: the function should return finalized transaction
	await tx.finalize(networkParams, alice.address);
	const txId = await network.submitTx(tx);
	network.tick(BigInt(10));
}

export const cancelProject = async (
		network: NetworkEmulator,
		alice : WalletEmulator,
		program: Program
		) => {

		const optimize = false;
		const compiledProgram = program.compile(optimize); 
		const validatorHash = compiledProgram.validatorHash;
		const validatorAddress = Address.fromValidatorHash(validatorHash); 
		const networkParamsFile = await fs.readFile('./src/preprod.json', 'utf8');
		const networkParams = new NetworkParams(JSON.parse(networkParamsFile.toString()));

		const keyMPH = '702cd6229f16532ca9735f65037092d099b0ff78a741c82db0847bbf'

		// with all above, a tx can be built: 
		const tx = new Tx();	

		const ownerAddress = alice.address;
		const ownerUtxos = await alice.utxos;

		const valRedeemer = new ConstrData(0, []);

		// compare to https://github.com/lley154/helios-examples/blob/704cf0a92cfe252b63ffb9fd36c92ffafc1d91f6/vesting/pages/index.tsx#L283
		const valUtxo = (await network.getUtxos(validatorAddress))[0]

		tx.addInput(valUtxo, valRedeemer);

		// Send the value of the of the valUTXO back to the owner
		tx.addOutput(new TxOutput(ownerAddress, valUtxo.value));

		// Specify when this transaction is valid from.   This is needed so
		// time is included in the transaction which will be use by the validator
		// script. in NetworkEmulator, init slot is 0;
		const emulatorDate = Number(await networkParams.slotToTime(0n)); 

		const earlierTime = new Date(emulatorDate);
		const laterTime = new Date(emulatorDate + 3 * 60 * 60 * 1000);

		tx.validFrom(earlierTime);
		tx.validTo(laterTime);

		// Add the recipiants pkh
		tx.addSigner(ownerAddress.pubKeyHash);

		// Add the validator script to the transaction
		tx.attachScript(compiledProgram);

		const colatUtxo = ownerUtxos[0];
		const spareUtxo = ownerUtxos[1];
		tx.addCollateral(colatUtxo);

		await tx.finalize(networkParams, ownerAddress, [spareUtxo]);

		const txId = await network.submitTx(tx);
		network.tick(BigInt(10));
}
