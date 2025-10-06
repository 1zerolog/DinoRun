# NFT Contract Deployment Guide

## Prerequisites

1. Install Foundry (Solidity development toolkit):
\`\`\`bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
\`\`\`

2. Get Base Mainnet ETH:
   - Bridge ETH to Base using https://bridge.base.org
   - Or buy directly on Base through exchanges

## Deployment Steps

### 1. Initialize Foundry Project

\`\`\`bash
forge init snake-nft-contract
cd snake-nft-contract
\`\`\`

### 2. Install OpenZeppelin Contracts

\`\`\`bash
forge install OpenZeppelin/openzeppelin-contracts
\`\`\`

### 3. Copy Contract

Copy the `contracts/SnakeGameNFT.sol` file to `src/SnakeGameNFT.sol`

### 4. Configure Foundry

Create `foundry.toml`:

\`\`\`toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
remappings = [
    "@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/"
]

[rpc_endpoints]
base_mainnet = "https://mainnet.base.org"
base_sepolia = "https://sepolia.base.org"
\`\`\`

### 5. Deploy Contract to Base Mainnet

\`\`\`bash
# Set your private key (NEVER commit this!)
export PRIVATE_KEY=your_private_key_here

# Deploy to Base Mainnet
forge create --rpc-url base_mainnet \
  --private-key $PRIVATE_KEY \
  src/SnakeGameNFT.sol:SnakeGameNFT
\`\`\`

**Note**: The contract owner is automatically set to `0xe1bf2Dd72A8A026bEb20d8bF75276DF260507eFc` in the constructor.

### 6. Update Contract Address

After deployment, copy the contract address and update it in `lib/contract.ts`:

\`\`\`typescript
export const SNAKE_NFT_CONTRACT = {
  address: "0xYourDeployedContractAddress", // Replace this
  // ... rest of config
}
\`\`\`

### 7. Verify Contract (Recommended)

\`\`\`bash
forge verify-contract \
  --chain-id 8453 \
  --compiler-version v0.8.20 \
  YOUR_CONTRACT_ADDRESS \
  src/SnakeGameNFT.sol:SnakeGameNFT \
  --etherscan-api-key YOUR_BASESCAN_API_KEY
\`\`\`

Get a BaseScan API key from: https://basescan.org/myapikey

## Testing Locally

Before deploying, test the contract:

\`\`\`bash
forge test
\`\`\`

## Testnet Deployment (Optional)

For testing before mainnet:

1. Get Base Sepolia ETH from https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
2. Deploy using `base_sepolia` RPC URL
3. Test the minting functionality
4. Once satisfied, deploy to mainnet

## Contract Features

- **ERC-721 NFT**: Each score is a unique NFT
- **Minimum Score**: Only scores ≥30 can be minted
- **On-chain Metadata**: Score and timestamp stored on-chain
- **Base64 Encoded**: Metadata is fully on-chain, no IPFS needed
- **Owner**: Set to `0xe1bf2Dd72A8A026bEb20d8bF75276DF260507eFc`

## Gas Costs

Approximate gas costs on Base Mainnet:
- Deployment: ~2-3M gas (~$0.50-1.00 USD)
- Minting: ~100-150k gas (~$0.02-0.05 USD per NFT)

Base has very low gas fees compared to Ethereum mainnet!

## After Deployment

1. Update the contract address in `lib/contract.ts`
2. Test minting by playing the game and scoring 30+
3. Share your game on Farcaster!
