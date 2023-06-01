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
export const cancelVesting = async (
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

		// somehow need to add this to context, defined in src/lockAda
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
