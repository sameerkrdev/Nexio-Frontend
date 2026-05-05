import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

const SOLANA_RPC = "https://api.devnet.solana.com";
const ETHEREUM_RPC = "https://ethereum-sepolia-rpc.publicnode.com";

export const balanceService = {
  getSolBalance: async (address: string): Promise<string> => {
    try {
      const connection = new Connection(SOLANA_RPC, "confirmed");
      const publicKey = new PublicKey(address);
      const balance = await connection.getBalance(publicKey);
      return (balance / LAMPORTS_PER_SOL).toFixed(4);
    } catch (error) {
      console.error("Error fetching SOL balance:", error);
      return "0.0000";
    }
  },

  getEthBalance: async (address: string): Promise<string> => {
    try {
      const response = await fetch(ETHEREUM_RPC, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_getBalance",
          params: [address, "latest"],
          id: 1,
        }),
      });
      const data = await response.json();
      console.log("ETH response:", JSON.stringify(data)); // ← debug log

      if (data.result) {
        const balanceWei = BigInt(data.result); // ← use BigInt not parseInt
        const balanceEth = Number(balanceWei) / 1e18;
        return balanceEth.toFixed(4);
      }
      return "0.0000";
    } catch (error) {
      console.error("Error fetching ETH balance:", error);
      return "0.0000";
    }
  },
};
