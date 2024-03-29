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
		bob :  WalletEmulator,
		program: Program,
		adaQty : number,
		duration : number
		) => {
	
	const optimize = false; // isnt there a way to set it globally?
	const compiledScript = program.compile(optimize);
	const validatorHash = compiledScript.validatorHash;
	const validatorAddress = Address.fromValidatorHash(validatorHash); 

	const benAddr = bob.address;
	const networkParamsFile = await fs.readFile('./src/preprod.json', 'utf8');
	const networkParams = new NetworkParams(JSON.parse(networkParamsFile.toString()));
	const emulatorDate = Number(await networkParams.slotToTime(0n)); 
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
		.mintTokens(
			mintProgram.mintingPolicyHash,
			tokens,
			mintRedeemer
		)
		// Add the destination address and the amount of Ada to lock including a datum
		.addOutput(new TxOutput(validatorAddress, lockedVal, inlineDatum));


	await tx.finalize(networkParams, alice.address);
	const txId = await network.submitTx(tx);
	network.tick(BigInt(10));
}
