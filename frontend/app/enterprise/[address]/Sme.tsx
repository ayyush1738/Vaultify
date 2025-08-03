'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId } from 'wagmi';
import { ArrowLeft, AlertCircle, Inbox, Loader2 } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import ExtractedMetadata from '../components/ExtractedMetadata';
import InvoiceTableCard from '../components/InvoiceTableCard';
import { ethers } from 'ethers';
import { supportedTokens } from '@/config/supportedTokens';

// Types
type Invoice = {
  id: string;
  customerName: string;
  invoiceAmount: string;
  preferredTokenSymbol: string;
  status: 'Pending Funding' | 'Funded' | 'Repaid';
  txHash: string;
  ipfsHash: string;
  createdAt: string;
};

export default function SMEDashboard() {
  const { address, isConnected } = useAccount();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedMetadata, setExtractedMetadata] = useState<any>(null);
  const [preferredToken, setPreferredToken] = useState(supportedTokens[0]);
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true);
  const [convertedAmount, setConvertedAmount] = useState<string | null>(null);
  const [balances, setBalances] = useState<Record<string, string> | null>(null);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  // No changes are needed here. This code is correct.
useEffect(() => {
  if (!address || !isConnected) {
    setBalances(null);
    return;
  }
  
  const fetchBalances = async () => {
    try {
      // This correctly creates the URL:
      // /api/balances/balance?chainId=1&walletAddress=0x...
      // This matches your server file's location.
      const res = await axios.get(`/api/balances/balance?chainId=1&walletAddress=${address}`);
      setBalances(res.data);
    } catch {
      setBalanceError('Failed to load balances.');
      setBalances(null);
    }
  };

  fetchBalances();
}, [address, isConnected]);


  const chainId = useChainId();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  // Fetch converted amount from /api/quote
  const fetchConvertedAmount = async (
    fromSymbol: string,
    toSymbol: string,
    amount: string
  ) => {
    try {
      const fromToken = supportedTokens.find((t) => t.symbol === fromSymbol);
      const toToken = supportedTokens.find((t) => t.symbol === toSymbol);

      if (!fromToken || !toToken) {
        console.warn('Unsupported token:', { fromSymbol, toSymbol });
        return;
      }

      const normalized = String(amount || '').replace(/[^0-9.]/g, '');
      if (!normalized || fromSymbol === toSymbol) {
        setConvertedAmount(normalized);
        return;
      }

      const decimals = fromToken.decimals ?? 18;
      const amountInWei = ethers.parseUnits(normalized, decimals);

      const res = await axios.get('/api/quote', {
        params: {
          fromTokenAddress: fromToken.address,
          toTokenAddress: toToken.address,
          amount: amountInWei.toString(),
          chainId: '1',
        },
      });

      const { dstAmount } = res.data;

      if (!dstAmount) {
        console.error('Invalid 1inch quote response:', res.data);
        setConvertedAmount(null);
        return;
      }

      const toDecimals = toToken.decimals ?? 18;
      const convertedFormatted = ethers.formatUnits(dstAmount, toDecimals);

      setConvertedAmount(convertedFormatted);

      setExtractedMetadata((prev: any) => ({
        ...prev,
        convertedAmount: convertedFormatted,
        preferredToken: toSymbol,
      }));
    } catch (err) {
      console.error('1inch price fetch failed:', err);
      setConvertedAmount(null);
    }
  };

  // Flag to determine if ready to mint
  const isReadyToMint =
    !!extractedMetadata &&
    !!extractedMetadata.customerName &&
    String(extractedMetadata.amount || '').replace(/[^0-9.]/g, '').length > 0;

  // Extracted fetchInvoices to be reusable
  const fetchInvoices = async () => {
    if (!address || !API_BASE) {
      setIsLoadingInvoices(false);
      setInvoices([]); // Clear invoices if no address/API_BASE
      return;
    }
    setIsLoadingInvoices(true);
    try {
      const token = localStorage.getItem('jwt') || '';
      const res = await axios.get(`${API_BASE}/api/v1/invoices/sme/${address}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setInvoices(res.data.invoices);
    } catch (err: any) {
      console.error('Failed to fetch invoices:', err?.response?.data || err?.message || err);
      setError('Failed to load invoices.');
    } finally {
      setIsLoadingInvoices(false);
    }
  };

  // Call fetchInvoices on mount and when address/API_BASE change
  useEffect(() => {
    fetchInvoices();
  }, [address, API_BASE]);

  // Handle file selection for invoice document
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError(null);
      const file = e.target.files?.[0] || null;
      setSelectedFile(file);
      setExtractedMetadata(null);

      if (!file) return;
      if (!API_BASE) {
        setError('NEXT_PUBLIC_API_URL is not set.');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      const token = (typeof window !== 'undefined' && localStorage.getItem('jwt')) || '';
      const res = await axios.post(`${API_BASE}/api/v1/enterprise/parse`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        maxBodyLength: Infinity,
      });

      setExtractedMetadata(res.data);

      // Fetch converted amount immediately for default token
      if (res.data.amount) {
        fetchConvertedAmount('USDC', preferredToken.symbol, res.data.amount);
      }
    } catch (err: any) {
      console.error('OCR parse failed:', err?.response?.data || err?.message || err);
      setError('Failed to parse the invoice.');
    }
  };

  // Mint NFT and auto-refresh invoice list on success
  const handleMintNFT = async () => {
    if (!selectedFile || !extractedMetadata || !address || !isReadyToMint) {
      setError('Please select a file, parse it, and ensure all required fields are filled.');
      return;
    }
    if (!API_BASE) {
      setError('NEXT_PUBLIC_API_URL is not set.');
      return;
    }
    setIsMinting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('smeAddress', address);
      formData.append('chainId', String(chainId));
      const amountToSend = convertedAmount ?? String(extractedMetadata.amount || '').replace(/[^0-9.]/g, '0');
      formData.append('invoiceAmount', amountToSend);
      formData.append('dueDate', extractedMetadata.dueDate || '');

      const customerName = (extractedMetadata.customerName || '').trim();
      formData.append('customerName', customerName);
      formData.append('preferredTokenSymbol', preferredToken.symbol);

      const token = (typeof window !== 'undefined' && localStorage.getItem('jwt')) || '';
      const res = await axios.post(`${API_BASE}/api/v1/enterprise/mint`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        maxBodyLength: Infinity,
      });

      // Instead of manually adding new invoice, re-fetch all invoices to get up-to-date list
      await fetchInvoices();

      setSelectedFile(null);
      setExtractedMetadata(null);
    } catch (err: any) {
      console.error('Mint failed:', err?.response?.data || err?.message || err);
      setError(err?.response?.data?.message || 'Minting failed.');
    } finally {
      setIsMinting(false);
    }
  };

  // Badge UI for invoice status
  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'Funded':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Funded</Badge>;
      case 'Pending Funding':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
      case 'Repaid':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Repaid</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
    {isConnected && (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-4">
      <CardHeader>
        <CardTitle>Your Token Balances</CardTitle>
        <CardDescription className="text-slate-400">
          Balances for address: {address}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingBalances ? (
          <div className="flex items-center gap-2 text-slate-400">
            <Loader2 className="animate-spin h-4 w-4" />
            Loading balances...
          </div>
        ) : balanceError ? (
          <div className="text-red-500">{balanceError}</div>
        ) : balances ? (
          <div className="flex flex-wrap gap-4">
            {Object.entries(balances)
              // Filter out zero balances (string "0" or "0.0")
              .filter(([, bal]) => {
                try {
                  // parseFloat check > 0 to handle decimal balances
                  return parseFloat(bal) > 0;
                } catch {
                  return false;
                }
              })
              .map(([tokenAddress, bal]) => {
                // Find symbol using your supportedTokens config if available
                const token = supportedTokens.find(t => t.address.toLowerCase() === tokenAddress.toLowerCase());
                const symbol = token?.symbol || tokenAddress;
                // Format balance nicely
                const formattedBal = bal.includes('.') ? parseFloat(bal).toFixed(4) : bal;

                return (
                  <Badge
                    key={tokenAddress}
                    className="bg-purple-600/20 text-purple-400 border-purple-600/40 px-3 py-1"
                  >
                    {symbol}: {formattedBal}
                  </Badge>
                );
              })}
          </div>
        ) : (
          <div className="text-slate-400">No balances found.</div>
        )}
      </CardContent>
    </Card>
  )}
      <nav className="flex items-center justify-between p-4 md:p-6 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50 bg-slate-900/80">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
              <ArrowLeft className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Back to Home</span>
            </Button>
          </Link>
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            SME Dashboard
          </h1>
        </div>
        <ConnectButton />
      </nav>

      <main className="p-4 md:p-6 max-w-7xl mx-auto space-y-8">
        {error && (
          <div className="flex items-center gap-3 text-red-400 bg-red-400/10 p-4 rounded-lg border border-red-400/30">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* --- Upload + Mint --- */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <Card className="lg:col-span-3 bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle>Tokenize a New Invoice</CardTitle>
              <CardDescription className="text-slate-400">
                Upload an invoice to turn it into a yield-bearing NFT.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="invoice-file" className="text-slate-300 mb-2 block">
                  Invoice Document
                </Label>
                <Input
                  id="invoice-file"
                  type="file"
                  accept=".pdf,.jpg,.png"
                  onChange={handleFileSelect}
                  className="bg-slate-800 border-white/20 text-slate-300 file:bg-purple-600 file:text-white file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4 hover:file:bg-purple-700"
                />
                <p className="text-xs text-slate-500 mt-2">Supported: PDF, JPG, PNG (Max 10MB)</p>
              </div>

              <div>
                <Label htmlFor="token-select" className="text-slate-300 mb-2 block">
                  Token to Receive Funds In
                </Label>
                <select
                  id="token-select"
                  value={preferredToken.symbol}
                  onChange={(e) => {
                    const token = supportedTokens.find(t => t.symbol === e.target.value);
                    if (token) {
                      setPreferredToken(token);
                      if (extractedMetadata?.amount) {
                        fetchConvertedAmount('USDC', token.symbol, extractedMetadata.amount);
                      }
                    }
                  }}
                  className="w-full bg-slate-800 text-white p-2 rounded-md border border-white/20 focus:ring-2 focus:ring-purple-500"
                >
                  {supportedTokens.map((token) => (
                    <option key={token.symbol} value={token.symbol}>
                      {token.symbol}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                onClick={handleMintNFT}
                disabled={!isConnected || isMinting || !isReadyToMint}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isMinting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Minting Invoice NFT...
                  </>
                ) : (
                  <>Mint Invoice NFT</>
                )}
              </Button>
            </CardContent>
          </Card>
          <ExtractedMetadata
            extractedMetadata={extractedMetadata}
            selectedFile={selectedFile}
            isReadyToMint={isReadyToMint}
            setExtractedMetadata={setExtractedMetadata}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Minted Invoices</h2>
          {isLoadingInvoices ? (
            <div className="flex items-center gap-2 text-slate-400">
              <Loader2 className="animate-spin h-4 w-4" />
              Loading invoices...
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 bg-white/5 border border-white/10 rounded-lg">
              <Inbox className="h-16 w-16 text-slate-500 mb-4" />
              <p className="text-slate-400">No invoices found. Upload one to get started!</p>
            </div>
          ) : (
            <InvoiceTableCard invoices={invoices} getStatusBadge={getStatusBadge} />
          )}
        </div>
      </main>
    </div>
  );
}
