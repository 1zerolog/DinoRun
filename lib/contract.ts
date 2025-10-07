// Contract configuration
export const DINO_NFT_CONTRACT = {
  // TODO: Deploy the contract using the Solidity file in contracts/DinoGameNFT.sol
  // Deploy to Base Mainnet (Chain ID: 8453)
  // Owner will be set to: 0xe1bf2Dd72A8A026bEb20d8bF75276DF260507eFc
  // Then replace this address with your deployed contract address
  address: "0x0000000000000000000000000000000000000000", // ⚠️ DEPLOY CONTRACT AND UPDATE THIS ADDRESS
  abi: [
    {
      inputs: [],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        { indexed: true, internalType: "address", name: "player", type: "address" },
        { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
        { indexed: false, internalType: "uint256", name: "score", type: "uint256" },
      ],
      name: "ScoreMinted",
      type: "event",
    },
    {
      inputs: [{ internalType: "uint256", name: "score", type: "uint256" }],
      name: "mintScore",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
      name: "getTokenScore",
      outputs: [
        {
          components: [
            { internalType: "address", name: "player", type: "address" },
            { internalType: "uint256", name: "score", type: "uint256" },
            { internalType: "uint256", name: "timestamp", type: "uint256" },
          ],
          internalType: "struct DinoGameNFT.GameScore",
          name: "",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
      name: "tokenURI",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
    },
  ],
} as const

export const BASE_MAINNET_CHAIN_ID = 8453
export const BASE_SEPOLIA_CHAIN_ID = 84532
