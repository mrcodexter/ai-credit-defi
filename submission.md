# Hackathon Submission: AI Credit Score DeFi Lending

## Project Name
**AI Credit Score DeFi Lending**

## Tagline
Unlocking the power of on-chain reputation with AI-driven under-collateralized loans.

## The Problem
Most DeFi lending platforms (like Aave or Compound) require high over-collateralization (e.g., 150%+). This excludes users who don't already have significant capital, creating a barrier to entry for the "unbanked" or new Web3 users.

## The Solution
We built a lending protocol on **HashKey Chain** that uses **AI (Google Gemini)** to analyze a user's on-chain history and generate a "Web3 Credit Score." 
- High-score users can access **under-collateralized loans**.
- Low-score users can build their reputation by repaying small loans.
- The entire process is automated via smart contracts and AI analysis.

## How it Works
1. **Connect**: User connects MetaMask to HashKey Testnet.
2. **Analyze**: AI analyzes the wallet's history (mocked for demo) and returns a score (0-100).
3. **Borrow**: User requests a loan up to their AI-calculated limit.
4. **Repay**: User repays the loan with 5% interest to improve their score.

## Challenges we ran into
- **Network Integration**: Configuring the HashKey Chain RPC and ensuring smooth transaction handling.
- **AI Reliability**: Crafting the right prompts for Gemini to ensure consistent JSON responses for the credit score.
- **UI/UX**: Creating a "technical yet approachable" dashboard that feels like a professional financial tool.

## Accomplishments that we're proud of
- Successfully integrated a real-world AI (Gemini) into a Web3 workflow.
- Built a fully functional end-to-end demo on HashKey Chain.
- Achieved a high-fidelity UI that stands out in a hackathon setting.

## What's next for AI Credit Score DeFi
- **ZK-Proofs**: Use Zero-Knowledge proofs to verify credit scores without revealing private wallet data.
- **Multi-Chain Analysis**: Aggregate data from multiple chains for a more accurate score.
- **Dynamic Interest Rates**: Adjust interest rates based on real-time credit score fluctuations.
