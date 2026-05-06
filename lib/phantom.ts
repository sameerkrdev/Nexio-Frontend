import * as Linking from "expo-linking";
import nacl from "tweetnacl";
import bs58 from "bs58";
import * as SecureStore from "expo-secure-store";

const KEY_STORE_KEY = "dapp_secret_key";

let _dappKeyPair: nacl.BoxKeyPair | null = null;

export const getDappKeyPair = async (): Promise<nacl.BoxKeyPair> => {
  if (_dappKeyPair) return _dappKeyPair;

  const stored = await SecureStore.getItemAsync(KEY_STORE_KEY);
  if (stored) {
    const secretKey = bs58.decode(stored);
    _dappKeyPair = nacl.box.keyPair.fromSecretKey(secretKey);
  } else {
    _dappKeyPair = nacl.box.keyPair();
    await SecureStore.setItemAsync(
      KEY_STORE_KEY,
      bs58.encode(_dappKeyPair.secretKey),
    );
  }

  return _dappKeyPair;
};

export const connectPhantom = async () => {
  const keyPair = await getDappKeyPair();
  const redirectUrl = Linking.createURL("onConnect");

  const params = new URLSearchParams({
    dapp_encryption_public_key: bs58.encode(keyPair.publicKey),
    cluster: "devnet",
    app_url: "https://fronteir.app",
    redirect_link: redirectUrl,
  });

  const url = `https://phantom.app/ul/v1/connect?${params.toString()}`;
  Linking.openURL(url);
};

/**
 * Send an unsigned transaction (base64) to Phantom for signing.
 * Phantom redirects back to `onSignTransaction` with the signed tx.
 * @param transactionBase64 - the backend-returned base64 unsigned transaction
 * @param session - the session token from the wallet store
 * @param sharedSecret - the shared secret from the wallet store
 */
export const signTransactionWithPhantom = async (
  transactionBase64: string,
  session: string,
  sharedSecret: Uint8Array
) => {
  const keyPair = await getDappKeyPair();
  const redirectUrl = Linking.createURL("onSignTransaction");

  // Backend returns base64 — decode to bytes without Buffer (not available in RN)
  const binaryStr = atob(transactionBase64);
  const txBytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    txBytes[i] = binaryStr.charCodeAt(i);
  }
  const txBase58 = bs58.encode(txBytes);

  const payload = JSON.stringify({ transaction: txBase58, session });

  // Encode string to bytes using TextEncoder instead of Buffer
  const payloadBytes = new TextEncoder().encode(payload);
  const nonce = nacl.randomBytes(24);
  const encryptedPayload = nacl.box.after(payloadBytes, nonce, sharedSecret);

  const params = new URLSearchParams({
    dapp_encryption_public_key: bs58.encode(keyPair.publicKey),
    nonce: bs58.encode(nonce),
    redirect_link: redirectUrl,
    payload: bs58.encode(encryptedPayload),
  });

  const url = `https://phantom.app/ul/v1/signTransaction?${params.toString()}`;
  Linking.openURL(url);
};

export const decryptPayload = (
  data: string,
  nonce: string,
  sharedSecret: Uint8Array,
): Record<string, string> => {
  const decrypted = nacl.box.open.after(
    bs58.decode(data),
    bs58.decode(nonce),
    sharedSecret,
  );
  if (!decrypted) throw new Error("Decryption failed");

  // Use TextDecoder instead of Buffer (Buffer not available in React Native)
  return JSON.parse(new TextDecoder().decode(decrypted));
};

export const handlePhantomConnect = async (url: string) => {
  try {
    const { queryParams } = Linking.parse(url);
    if (!queryParams) return null;

    const phantomEncPubKey = queryParams[
      "phantom_encryption_public_key"
    ] as string;
    const nonce = queryParams["nonce"] as string;
    const data = queryParams["data"] as string;

    if (!phantomEncPubKey || !nonce || !data) return null;

    const keyPair = await getDappKeyPair();
    const phantomKey = bs58.decode(phantomEncPubKey);
    const sharedSecret = nacl.box.before(phantomKey, keyPair.secretKey);
    const payload = decryptPayload(data, nonce, sharedSecret);

    return {
      address: payload.public_key as string,
      phantomKey,
      secret: sharedSecret,
      session: payload.session as string,
    };
  } catch (e) {
    console.error("handlePhantomConnect error", e);
    return null;
  }
};
