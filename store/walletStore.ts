import { useState, useEffect } from "react";

let walletAddress: string | null = null;
let phantomPublicKey: Uint8Array | null = null;
let sharedSecret: Uint8Array | null = null;
let session: string | null = null;
let listeners: (() => void)[] = [];

const notify = () => listeners.forEach((l) => l());

export const setWalletData = (data: {
  address: string;
  phantomKey: Uint8Array;
  secret: Uint8Array;
  session: string;
}) => {
  walletAddress = data.address;
  phantomPublicKey = data.phantomKey;
  sharedSecret = data.secret;
  session = data.session;
  notify();
};

export const getWalletAddress = () => walletAddress;
export const getSharedSecret = () => sharedSecret;
export const getSession = () => session;

export const useWallet = () => {
  const [address, setAddress] = useState(walletAddress);
  useEffect(() => {
    const handler = () => setAddress(walletAddress);
    listeners.push(handler);
    return () => {
      listeners = listeners.filter((l) => l !== handler);
    };
  }, []);
  return { address };
};
