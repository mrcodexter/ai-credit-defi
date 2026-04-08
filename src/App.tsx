/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { motion, AnimatePresence } from "motion/react";
import { 
  Wallet, 
  ShieldCheck, 
  TrendingUp, 
  ArrowRightLeft, 
  Info, 
  AlertCircle, 
  CheckCircle2,
  RefreshCcw,
  Coins,
  CreditCard
} from "lucide-react";
import { connectWallet, getContract, switchNetwork, CONTRACT_ADDRESS } from "@/src/lib/web3";
import { generateCreditScore, CreditScoreResult } from "@/src/services/aiService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

export default function App() {
  const [address, setAddress] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [creditResult, setCreditResult] = useState<CreditScoreResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loanAmount, setLoanAmount] = useState<string>("");
  const [activeLoan, setActiveLoan] = useState<any>(null);
  const [poolBalance, setPoolBalance] = useState<string>("0");

  useEffect(() => {
    if (address) {
      fetchLoanData();
    }
  }, [address]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await switchNetwork();
      const { address } = await connectWallet();
      setAddress(address);
      toast.success("Wallet connected!");
    } catch (error: any) {
      toast.error(error.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAnalyze = async () => {
    if (!address) return;
    setIsAnalyzing(true);
    try {
      const result = await generateCreditScore(address);
      setCreditResult(result);
      toast.success("AI Credit Analysis Complete!");
    } catch (error) {
      toast.error("Failed to analyze credit score");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fetchLoanData = async () => {
    try {
      const { signer } = await connectWallet();
      const contract = getContract(signer);
      
      // Check if contract is deployed (address not 0x0)
      if (CONTRACT_ADDRESS !== ethers.ZeroAddress) {
        const loan = await contract.loans(address);
        if (loan.active) {
          setActiveLoan({
            amount: ethers.formatEther(loan.amount),
            repaymentAmount: ethers.formatEther(loan.repaymentAmount),
            dueDate: new Date(Number(loan.dueDate) * 1000).toLocaleDateString(),
          });
        } else {
          setActiveLoan(null);
        }
        const balance = await contract.getPoolBalance();
        setPoolBalance(ethers.formatEther(balance));
      } else {
        // Mock data for demo if no contract
        console.log("Using mock data - contract not deployed");
      }
    } catch (error) {
      console.error("Error fetching loan data:", error);
    }
  };

  const handleRequestLoan = async () => {
    if (!loanAmount || !creditResult) return;
    try {
      const { signer } = await connectWallet();
      const contract = getContract(signer);
      
      if (CONTRACT_ADDRESS === ethers.ZeroAddress) {
        toast.info("Demo Mode: In a real app, this would trigger a MetaMask transaction.");
        setActiveLoan({
          amount: loanAmount,
          repaymentAmount: (Number(loanAmount) * 1.05).toFixed(4),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        });
        return;
      }

      const tx = await contract.requestLoan(ethers.parseEther(loanAmount));
      toast.promise(tx.wait(), {
        loading: "Processing loan request...",
        success: "Loan disbursed successfully!",
        error: "Loan request failed",
      });
      await fetchLoanData();
    } catch (error: any) {
      toast.error(error.reason || error.message || "Transaction failed");
    }
  };

  const handleRepayLoan = async () => {
    try {
      const { signer } = await connectWallet();
      const contract = getContract(signer);

      if (CONTRACT_ADDRESS === ethers.ZeroAddress) {
        toast.success("Demo Mode: Loan repaid successfully!");
        setActiveLoan(null);
        return;
      }

      const loan = await contract.loans(address);
      const tx = await contract.repayLoan({ value: loan.repaymentAmount });
      toast.promise(tx.wait(), {
        loading: "Processing repayment...",
        success: "Loan repaid! Credit score improved.",
        error: "Repayment failed",
      });
      await fetchLoanData();
    } catch (error: any) {
      toast.error(error.reason || error.message || "Transaction failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-emerald-500/30">
      <Toaster position="top-center" theme="dark" />
      
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <ShieldCheck className="text-black w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">AI Credit <span className="text-emerald-500">DeFi</span></span>
          </div>
          
          <div className="flex items-center gap-4">
            {address ? (
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-mono text-white/70">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              </div>
            ) : (
              <Button 
                onClick={handleConnect} 
                disabled={isConnecting}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-full px-8"
              >
                {isConnecting ? <RefreshCcw className="animate-spin w-4 h-4 mr-2" /> : <Wallet className="w-4 h-4 mr-2" />}
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {!address ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 max-w-2xl"
            >
              <h1 className="text-6xl font-extrabold tracking-tighter leading-none">
                The Future of <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
                  Credit-Based Lending
                </span>
              </h1>
              <p className="text-xl text-white/50 leading-relaxed">
                Connect your wallet to get an AI-powered credit score and unlock under-collateralized loans on HashKey Chain.
              </p>
              <Button 
                onClick={handleConnect}
                size="lg"
                className="bg-white text-black hover:bg-white/90 rounded-full px-12 py-7 text-lg font-bold shadow-2xl shadow-white/10"
              >
                Get Started
              </Button>
            </motion.div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: AI Analysis */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    AI Credit Profile
                  </CardTitle>
                  <CardDescription className="text-white/50">
                    Real-time on-chain reputation analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!creditResult ? (
                    <div className="py-8 text-center space-y-4">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                        <ShieldCheck className="w-10 h-10 text-white/20" />
                      </div>
                      <p className="text-sm text-white/40">No analysis found for this wallet.</p>
                      <Button 
                        onClick={handleAnalyze} 
                        disabled={isAnalyzing}
                        className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20"
                      >
                        {isAnalyzing ? <RefreshCcw className="animate-spin w-4 h-4 mr-2" /> : "Run AI Analysis"}
                      </Button>
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-6"
                    >
                      <div className="text-center space-y-2">
                        <div className="text-5xl font-black text-emerald-500">{creditResult.score}</div>
                        <div className="text-xs uppercase tracking-widest text-white/40 font-bold">Credit Score</div>
                      </div>
                      
                      <Progress value={creditResult.score} className="h-2 bg-white/5" />
                      
                      <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-white/60 uppercase tracking-wider">
                          <Info className="w-3 h-3" />
                          AI Insight
                        </div>
                        <p className="text-sm text-white/80 italic leading-relaxed">
                          "{creditResult.reason}"
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-white/10">
                        <span className="text-sm text-white/40">Borrowing Limit</span>
                        <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/5">
                          {creditResult.limit} HSK
                        </Badge>
                      </div>

                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleAnalyze}
                        className="w-full text-white/40 hover:text-white"
                      >
                        Recalculate Score
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>

              <Alert className="bg-blue-500/10 border-blue-500/20 text-blue-400">
                <Info className="h-4 w-4" />
                <AlertTitle>HashKey Testnet</AlertTitle>
                <AlertDescription>
                  Pool Liquidity: {poolBalance} HSK
                </AlertDescription>
              </Alert>
            </div>

            {/* Right Column: Loan Actions */}
            <div className="lg:col-span-8 space-y-6">
              <AnimatePresence mode="wait">
                {activeLoan ? (
                  <motion.div
                    key="active-loan"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Card className="bg-emerald-500/5 border-emerald-500/20">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-white flex items-center gap-2">
                              <Coins className="w-5 h-5 text-emerald-500" />
                              Active Loan
                            </CardTitle>
                            <CardDescription className="text-white/50">
                              Manage your current debt
                            </CardDescription>
                          </div>
                          <Badge className="bg-emerald-500 text-black">Active</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                          <span className="text-xs text-white/40 uppercase font-bold tracking-wider">Borrowed</span>
                          <div className="text-2xl font-bold text-white">{activeLoan.amount} HSK</div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-white/40 uppercase font-bold tracking-wider">Repayment</span>
                          <div className="text-2xl font-bold text-emerald-500">{activeLoan.repaymentAmount} HSK</div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-white/40 uppercase font-bold tracking-wider">Due Date</span>
                          <div className="text-2xl font-bold text-white/80">{activeLoan.dueDate}</div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t border-white/10 pt-6">
                        <Button 
                          onClick={handleRepayLoan}
                          className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-12"
                        >
                          Repay Loan Now
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ) : (
                  <motion.div
                    key="request-loan"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Card className="bg-white/5 border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-blue-500" />
                          Request Loan
                        </CardTitle>
                        <CardDescription className="text-white/50">
                          Instant disbursement based on your AI score
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {!creditResult ? (
                          <div className="p-8 border-2 border-dashed border-white/10 rounded-2xl text-center space-y-4">
                            <AlertCircle className="w-12 h-12 text-white/20 mx-auto" />
                            <p className="text-white/40">You must analyze your credit score before requesting a loan.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-white/60">Loan Amount (HSK)</label>
                              <div className="relative">
                                <Input 
                                  type="number" 
                                  placeholder="0.00" 
                                  value={loanAmount}
                                  onChange={(e) => setLoanAmount(e.target.value)}
                                  className="bg-black/50 border-white/10 h-14 text-xl font-bold pl-12"
                                />
                                <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-white/30">
                                  MAX: {creditResult.limit}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <div className="text-xs text-white/40 uppercase font-bold mb-1">Interest Rate</div>
                                <div className="text-lg font-bold text-emerald-500">5% Fixed</div>
                              </div>
                              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <div className="text-xs text-white/40 uppercase font-bold mb-1">Duration</div>
                                <div className="text-lg font-bold text-white">30 Days</div>
                              </div>
                            </div>

                            {loanAmount && Number(loanAmount) > creditResult.limit && (
                              <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Limit Exceeded</AlertTitle>
                                <AlertDescription>
                                  Your credit score only allows for a max loan of {creditResult.limit} HSK.
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="border-t border-white/10 pt-6">
                        <Button 
                          disabled={!loanAmount || !creditResult || Number(loanAmount) > creditResult.limit || Number(loanAmount) <= 0}
                          onClick={handleRequestLoan}
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 rounded-xl"
                        >
                          Request Instant Loan
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Activity Feed */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Credit Score Updated</div>
                        <div className="text-xs text-white/40">Just now</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-emerald-500 border-emerald-500/20">+5 Points</Badge>
                  </div>
                  <div className="flex items-center justify-center py-8">
                    <p className="text-xs text-white/20 uppercase tracking-widest font-bold">End of History</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-12 mt-12 bg-black/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 opacity-50">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm font-bold">HashKey Horizon Hackathon 2026</span>
          </div>
          <div className="flex gap-8 text-sm text-white/40 font-medium">
            <a href="#" className="hover:text-emerald-500 transition-colors">Documentation</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Smart Contract</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">HashKey Explorer</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
