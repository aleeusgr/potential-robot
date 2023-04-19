import { Blockfrost, Lucid } from "lucid-cardano"; // NPM

const lucid = await Lucid.new(
  new Blockfrost("https://cardano-preview.blockfrost.io/api/v0", "testnetXWdDgoYImp12FdSKhIGNL9oNJZAN7evl"),
  "Preview",
);

// Assumes you are in a browser environment
const api = await window.cardano.nami.enable();
lucid.selectWallet(api);

const tx = await lucid.newTx()
  .payToAddress("addr...", { lovelace: 5000000n })
  .complete();

const signedTx = await tx.sign().complete();

const txHash = await signedTx.submit();

console.log(txHash);
