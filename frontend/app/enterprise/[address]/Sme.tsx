'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId } from 'wagmi';
import { ArrowLeft, FileText, CheckCircle, Clock, Loader2, AlertCircle, Inbox } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import ExtractedMetadata from '../components/ExtractedMetadata';
import InvoiceTableCard from '../components/InvoiceTableCard';

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

// Supported tokens
const supportedTokens = [
    { symbol: 'USDC', address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' },
    { symbol: 'DAI', address: '0x3e622317f8C93f7328350cF0B56d9eD4C620C5d6' },
    { symbol: 'ETH', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' },
];

export default function SMEDashboard() {
  const { address, isConnected } = useAccount();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedMetadata, setExtractedMetadata] = useState<any>(null);
  const [preferredToken, setPreferredToken] = useState(supportedTokens[0]);
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true);

  // FIX: Include the customerName check in `isReadyToMint` to align with the minting logic
  const isReadyToMint =
    !!extractedMetadata &&
    !!extractedMetadata.customerName &&
    String(extractedMetadata.amount || '').replace(/[^0-9.]/g, '').length > 0;

  const chainId = useChainId();

  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  // ... (imports)

// This assumes your API_BASE environment variable is correctly set

useEffect(() => {
  const fetchInvoices = async () => {
    // Check for both address and API_BASE before making the call
    if (!address || !API_BASE) {
      setIsLoadingInvoices(false); // Make sure to stop loading if conditions aren't met
      return;
    }

    try {
      const token = localStorage.getItem('jwt') || '';
      // FIX: Use URL parameter in the API endpoint
      const res = await axios.get(`${API_BASE}/api/v1/invoices/sme/${address}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // FIX: Access the 'invoices' property from the response data
      setInvoices(res.data.invoices);
    } catch (err: any) {
      console.error('Failed to fetch invoices:', err?.response?.data || err?.message || err);
      // You might want to set an error state here as well
      // setError('Failed to load invoices.'); 
    } finally {
      setIsLoadingInvoices(false);
    }
  };

  fetchInvoices();
  // Add dependencies to the useEffect hook
}, [address, API_BASE]);

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
    } catch (err: any) {
      console.error('OCR parse failed:', err?.response?.data || err?.message || err);
      setError('Failed to parse the invoice.');
    }
  };

  const handleMintNFT = async () => {
    if (!selectedFile || !extractedMetadata || !address || !isReadyToMint) { // FIX: Use the `isReadyToMint` check
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
      const normalizedAmount = String(extractedMetadata.amount || '').replace(/[^0-9.]/g, '');
      formData.append('invoiceAmount', normalizedAmount || '0');
      formData.append('dueDate', extractedMetadata.dueDate || '');
      // FIX: Ensure customerName is always a string and not null
      const customerName = (extractedMetadata.customerName || '').trim();
      formData.append('customerName', customerName);
      formData.append('preferredTokenSymbol', preferredToken.symbol);

      console.log(preferredToken);

      const token = (typeof window !== 'undefined' && localStorage.getItem('jwt')) || '';
      const res = await axios.post(`${API_BASE}/api/v1/enterprise/mint`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        maxBodyLength: Infinity,
      });

      // FIX: The new invoice object should match the `Invoice` type.
      // Assuming the API returns the full invoice object, we can add it directly.
      const newInvoice: Invoice = res.data;
      setInvoices(prev => [newInvoice, ...prev]);
      setSelectedFile(null);
      setExtractedMetadata(null);
    } catch (err: any) {
      console.error('Mint failed:', err?.response?.data || err?.message || err);
      setError(err?.response?.data?.message || 'Minting failed.');
    } finally {
      setIsMinting(false);
    }
  };

  // FIX: This function is defined but not used in this component.
  // Assuming it's meant to be passed to `InvoiceTableCard`.
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
                    if (token) setPreferredToken(token);
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
                disabled={!isConnected || isMinting || !isReadyToMint} // FIX: simplified the disabled check
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
            <InvoiceTableCard invoices={invoices} getStatusBadge={getStatusBadge} /> // FIX: Pass getStatusBadge as a prop
          )}
        </div>
      </main>
    </div>
  );
}