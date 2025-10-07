import { createPublicClient, createWalletClient, custom, http } from "viem"
import { base } from "viem/chains"

export function getPublicClient() {
  return createPublicClient({
    chain: base,
    transport: http(),
  })
}

export function getWalletClient() {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    throw new Error("No ethereum provider found")
  }

  return createWalletClient({
    chain: base,
    transport: custom((window as any).ethereum),
  })
}

export async function switchToBaseNetwork() {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    throw new Error("No ethereum provider found")
  }

  try {
    await (window as any).ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x2105" }], // Base Mainnet
    })
  } catch (error: any) {
    // Chain not added, add it
    if (error.code === 4902) {
      await (window as any).ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x2105",
            chainName: "Base",
            nativeCurrency: {
              name: "Ethereum",
              symbol: "ETH",
              decimals: 18,
            },
            rpcUrls: ["https://mainnet.base.org"],
            blockExplorerUrls: ["https://basescan.org"],
          },
        ],
      })
    } else {
      throw error
    }
  }
}
