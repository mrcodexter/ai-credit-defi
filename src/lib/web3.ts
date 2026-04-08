import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum: any;
  }
}

export const LENDING_POOL_ABI = [
  "function creditScores(address) view returns (uint256)",
  "function loans(address) view returns (uint256 amount, uint256 repaymentAmount, uint256 dueDate, bool active, bool repaid)",
  "function updateCreditScore(address _user, uint256 _score) external",
  "function requestLoan(uint256 _amount) external",
  "function repayLoan() external payable",
  "function getPoolBalance() view returns (uint256)",
  "event LoanRequested(address indexed borrower, uint256 amount, uint256 repaymentAmount)",
  "event LoanRepaid(address indexed borrower, uint256 amount)",
  "event CreditScoreUpdated(address indexed user, uint256 score)"
];

// For the hackathon demo, we can use a placeholder address if the user hasn't deployed yet
export const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; 

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask not found. Please install it.");
  }
  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  return { provider, signer, address: accounts[0] };
}

export function getContract(signer: ethers.Signer) {
  return new ethers.Contract(CONTRACT_ADDRESS, LENDING_POOL_ABI, signer);
}

export const HASHKEY_TESTNET_PARAMS = {
  chainId: "0x85", // 133 in hex
  chainName: "HashKey Chain Testnet",
  nativeCurrency: {
    name: "HSK",
    symbol: "HSK",
    decimals: 18,
  },
  rpcUrls: ["https://testnet.hsk.xyz"],
  blockExplorerUrls: ["https://explorer.testnet.hsk.xyz"],
};

export async function switchNetwork() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: HASHKEY_TESTNET_PARAMS.chainId }],
    });
  } catch (error: any) {
    if (error.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [HASHKEY_TESTNET_PARAMS],
      });
    }
  }
}
