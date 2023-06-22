import { describe, expect, it, expectTypeOf, beforeEach, vi } from 'vitest'
import { promises as fs } from 'fs';
import {
	hexToBytes,
	Assets,
	ByteArrayData,
	ConstrData,
	MintingPolicyHash,
	NetworkEmulator,
	NetworkParams,
	Program,
	Tx,
	TxOutput,
	Value
} from "@hyperionbt/helios";


import {lockAda} from './src/lockAda.ts';

describe("create a network with two wallets of which one has an nft", async () => {

	// https://vitest.dev/guide/test-context.html
	beforeEach(async (context) => { 

		const minAda = BigInt(2000000);  // minimum lovelace needed to send an NFT
		const network = new NetworkEmulator();

		const alice = network.createWallet(BigInt(20000000));
		network.createUtxo(alice, BigInt(5000000));

		network.tick(10n)

		const amt = 5n;
		const name = 'name';
		const utxos = await alice.utxos;
		const script = await fs.readFile('./src/nft.hl', 'utf8'); 
		const nftProgram = Program.new(script);
		//const nftProgram = new Program();
		nftProgram.parameters = {["TX_ID"] : utxos[0].txId.hex};
		nftProgram.parameters = {["TX_IDX"] : utxos[0].utxoIdx};
		nftProgram.parameters = {["TN"] : name};
		const nftCompiledProgram = nftProgram.compile(false);
		const nftTokenName = ByteArrayData.fromString(name).toHex();
		const tokens: [number[], bigint][] = [[hexToBytes(nftTokenName), amt]];

		const mintRedeemer = new ConstrData(0, []);
		const tx = new Tx()
			.addInputs(utxos)
			.attachScript(nftCompiledProgram)
			.mintTokens(
			      nftCompiledProgram.mintingPolicyHash,
			      tokens,
			      mintRedeemer)
			.addOutput(new TxOutput(
			      (await alice.address),
			      new Value(minAda, new Assets([[nftCompiledProgram.mintingPolicyHash, tokens]]))
			    ));
				    
				// expect(tx.dump().body).toBe();

		const networkParamsFile = await fs.readFile('./src/preprod.json', 'utf8');
		const networkParams = new NetworkParams(JSON.parse(networkParamsFile.toString()));
		await tx.finalize(networkParams, alice.address);
		const txId = await network.submitTx(tx);
		network.tick(10n);

		context.alice = alice;
		context.network = network;

	})

	it ("docs the tx ingridients", async ({network, alice, }) => {
		// https://www.hyperion-bt.org/helios-book/api/reference/address.html?highlight=Address#address
		expect(alice.address.toHex().length).toBe(58)
		expect((await alice.utxos)[0].value.dump().lovelace).toBe('2000000');
		expect(Object.keys((await alice.utxos)[1].value.dump().assets)[0]).toBe();
	})

})
