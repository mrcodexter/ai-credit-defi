# AI Credit Score DeFi Lending dApp

An AI-powered decentralized lending platform built for the **HashKey Chain Horizon Hackathon**. This dApp enables under-collateralized loans by generating an AI-driven credit score based on on-chain reputation.

## 🚀 Features
- **MetaMask Integration**: Connect and interact with the HashKey Chain Testnet.
- **AI Credit Scoring**: Uses Google Gemini AI to analyze wallet reputation and determine borrowing limits.
- **Instant Loans**: Request HSK loans instantly based on your credit score.
- **Loan Management**: Track active loans and repay them directly through the UI.
- **Modern UI**: Polished, dark-themed dashboard built with Tailwind CSS and Framer Motion.

## 🛠 Tech Stack
- **Blockchain**: HashKey Chain Testnet (Chain ID: 133)
- **Smart Contracts**: Solidity, Hardhat
- **Frontend**: React, Vite, Ethers.js
- **AI**: Google Gemini API
- **Styling**: Tailwind CSS, Shadcn UI, Lucide Icons

## 📦 Project Structure
```
├── contracts/           # Solidity Smart Contracts
│   └── LendingPool.sol  # Main lending logic
├── scripts/             # Deployment scripts
│   └── deploy.ts        # Hardhat deployment script
├── src/                 # Frontend Source
│   ├── components/      # UI Components (Shadcn)
│   ├── lib/             # Web3 & Utils
│   ├── services/        # AI Service (Gemini)
│   └── App.tsx          # Main Application logic
├── hardhat.config.ts    # Hardhat Configuration
└── package.json         # Dependencies
```

## 🚀 Getting Started

### 1. Prerequisites
- Node.js installed
- MetaMask browser extension

### 2. Setup
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and add your credentials:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   PRIVATE_KEY=your_wallet_private_key (for deployment)
   ```

### 3. Smart Contract Deployment (Optional)
The dApp comes with a pre-configured contract address. To deploy your own:
```bash
npx hardhat run scripts/deploy.ts --network hashkey
```
Update `CONTRACT_ADDRESS` in `src/lib/web3.ts` with your new address.

### 4. Run Frontend
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Network Details (HashKey Testnet)
- **RPC URL**: https://testnet.hsk.xyz
- **Chain ID**: 133
- **Currency**: HSK

## 📄 License
MIT
