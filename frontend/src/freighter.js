import {
  setAllowed,
  getPublicKey,
  signTransaction
} from "@stellar/freighter-api";

export const connectWallet = async () => {
  await setAllowed();
  const address = await getPublicKey();
  return address;
};

export const signTx = async (xdr) => {
  return await signTransaction(xdr, {
    networkPassphrase: "Test SDF Network ; September 2015",
  });
};