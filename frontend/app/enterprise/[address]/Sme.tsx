'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from 'wagmi';
import { ArrowLeft, Upload, FileText, CheckCircle, Clock, Loader2, AlertCircle, Inbox } from 'lucide-react';
import Link from 'next/link';

// Enhanced Invoice interface to match table data
interface Invoice {
  id: string;
  fileName: string;
  amount: string;
  customer: string;
  dueDate: string;
  status: 'Funded' | 'Pending Funding' | 'Repaid';
  uploadDate: string;
}

// Mock token list
const supportedTokens = [
  { symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
  { symbol: 'DAI', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F' },
  { symbol: 'ETH', address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' },
];

// Mock backend data for demonstration
const mockInvoices: Invoice[] = [
    { id: 'INV-001', fileName: 'q3-services.pdf', amount: '$5,000.00', customer: 'TechCorp', dueDate: '2025-08-15', status: 'Funded', uploadDate: '2025-06-20' },
    { id: 'INV-002', fileName: 'design-assets.pdf', amount: '$2,500.00', customer: 'Creative LLC', dueDate: '2025-08-22', status: 'Pending Funding', uploadDate: '2025-07-01' },
    { id: 'INV-003', fileName: 'consulting-fee.pdf', amount: '$10,000.00', customer: 'Global Solutions', dueDate: '2025-07-30', status: 'Repaid', uploadDate: '2025-05-15'},
];


export default function SMEDashboard() {
  const { address, isConnected } = useAccount();

  // State for the upload/minting process
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedMetadata, setExtractedMetadata] = useState<any>(null);
  const [preferredToken, setPreferredToken] = useState(supportedTokens[0]);
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for the invoice list
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true);

  // --- DATA FETCHING ---
  useEffect(() => {
    // Fetches the SME's invoices when their wallet is connected
    const fetchInvoices = async () => {
      if (!isConnected || !address) {
        setIsLoadingInvoices(false);
        setInvoices([]); // Clear invoices if wallet disconnects
        return;
      }
      setIsLoadingInvoices(true);
      try {
        // In a real app, this would be an API call:
        // const response = await fetch(`/api/invoices?smeAddress=${address}`);
        // const data = await response.json();
        // setInvoices(data);

        // For demonstration, we use mock data after a short delay
        setTimeout(() => {
          setInvoices(mockInvoices);
          setIsLoadingInvoices(false);
        }, 1500);

      } catch (err) {
        setError("Failed to fetch your invoices.");
        setIsLoadingInvoices(false);
      }
    };

    fetchInvoices();
  }, [isConnected, address]);


  // --- UI HANDLERS ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Mocking OCR extraction for immediate UI feedback
      const mockMetadata = {
        invoiceNumber: 'INV-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
        amount: '$' + (Math.random() * 5000 + 1000).toFixed(2),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        customerName: 'New Client Ltd.',
      };
      setExtractedMetadata(mockMetadata);
      setError(null);
    }
  };

  const handleMintNFT = async () => {
    if (!selectedFile || !extractedMetadata || !address) {
      setError("Please select a file and connect your wallet to mint.");
      return;
    }

    setIsMinting(true);
    setError(null);

    // Simulate backend API call
    setTimeout(() => {
      try {
        // This is where you would POST to your backend.
        // const formData = new FormData();
        // formData.append('file', selectedFile);
        // formData.append('smeAddress', address);
        // formData.append('preferredToken', preferredToken.symbol);
        // ... other metadata
        // const response = await fetch('/api/v1/invoices/mint', { method: 'POST', body: formData });
        
        // --- On Success (simulated) ---
        const newInvoice: Invoice = {
            id: extractedMetadata.invoiceNumber,
            fileName: selectedFile.name,
            amount: extractedMetadata.amount,
            customer: extractedMetadata.customerName,
            dueDate: extractedMetadata.dueDate,
            status: 'Pending Funding',
            uploadDate: new Date().toISOString().split('T')[0],
        };

        // Add the new invoice to the top of the list for immediate feedback
        setInvoices(prevInvoices => [newInvoice, ...prevInvoices]);

        // Reset the form
        setSelectedFile(null);
        setExtractedMetadata(null);

      } catch (err: any) {
        setError(err.message || "An unexpected error occurred during minting.");
      } finally {
        setIsMinting(false);
      }
    }, 2000); // Simulate network delay
  };

  const handleRepay = (invoiceId: string) => {
    // In a real app, this would trigger a smart contract interaction
    // where the SME deposits the repayment amount.
    console.log(`Initiating repayment for invoice: ${invoiceId}`);
    
    // For UI demonstration, we'll just update the status locally.
    setInvoices(invoices.map(inv => 
        inv.id === invoiceId ? { ...inv, status: 'Repaid' } : inv
    ));
  };

  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'Funded':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Funded</Badge>;
      case 'Pending Funding':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
      case 'Repaid':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Repaid</Badge>;
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

        {/* --- UPLOAD AND MINT SECTION --- */}
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
                        <Label htmlFor="invoice-file" className="text-slate-300 mb-2 block">Invoice Document</Label>
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
                        <Label htmlFor="token-select" className="text-slate-300 mb-2 block">Token to Receive Funds In</Label>
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
                        disabled={!selectedFile || !extractedMetadata || !isConnected || isMinting}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isMinting ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Minting Invoice NFT...</>
                        ) : (
                        <>Mint Invoice NFT</>
                        )}
                    </Button>
                </CardContent>
            </Card>
            
            {/* --- METADATA PREVIEW --- */}
            <Card className="lg:col-span-2 bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                    <CardTitle>Metadata Preview</CardTitle>
                    <CardDescription className="text-slate-400">Verify extracted data before minting.</CardDescription>
                </CardHeader>
                <CardContent>
                    {extractedMetadata ? (
                    <div className="space-y-4 text-sm">
                        <div className="flex justify-between items-center">
                            <Label className="text-slate-400">Invoice Number</Label>
                            <p className="font-mono text-white">{extractedMetadata.invoiceNumber}</p>
                        </div>
                         <div className="flex justify-between items-center">
                            <Label className="text-slate-400">Amount</Label>
                            <p className="font-medium text-lg text-green-400">{extractedMetadata.amount}</p>
                        </div>
                         <div className="flex justify-between items-center">
                            <Label className="text-slate-400">Due Date</Label>
                            <p className="text-white">{extractedMetadata.dueDate}</p>
                        </div>
                        <div className="flex justify-between items-center">
                            <Label className="text-slate-400">Customer</Label>
                            <p className="text-white">{extractedMetadata.customerName}</p>
                        </div>
                        <div className="pt-2 mt-2 border-t border-white/10 flex justify-between items-center text-green-400">
                             <CheckCircle className="h-5 w-5" />
                            <p className="font-medium">Ready to Mint</p>
                        </div>
                    </div>
                    ) : (
                    <div className="text-center py-10 text-slate-500">
                        {selectedFile ? (
                           <div className="flex flex-col items-center gap-2">
                             <Clock className="h-8 w-8 animate-spin" />
                             <p>Extracting metadata...</p>
                           </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <FileText className="h-8 w-8" />
                                <p>Upload an invoice to see a preview</p>
                            </div>
                        )}
                    </div>
                    )}
                </CardContent>
            </Card>
        </div>

        {/* --- INVOICE LIST SECTION --- */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
                <CardTitle>My Tokenized Invoices</CardTitle>
                <CardDescription className="text-slate-400">
                    A list of your on-chain invoices.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/10">
                            <TableHead className="text-white">Invoice ID</TableHead>
                            <TableHead className="text-white">Customer</TableHead>
                            <TableHead className="text-white text-right">Amount</TableHead>
                            <TableHead className="text-white text-center">Status</TableHead>
                            <TableHead className="text-white text-right">Due Date</TableHead>
                            <TableHead className="text-white text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoadingInvoices ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={i} className="border-white/10 animate-pulse">
                                    <TableCell><div className="h-4 bg-slate-700 rounded w-20"></div></TableCell>
                                    <TableCell><div className="h-4 bg-slate-700 rounded w-24"></div></TableCell>
                                    <TableCell className="text-right"><div className="h-4 bg-slate-700 rounded w-16 ml-auto"></div></TableCell>
                                    <TableCell className="text-center"><div className="h-6 bg-slate-700 rounded w-20 mx-auto"></div></TableCell>
                                    <TableCell className="text-right"><div className="h-4 bg-slate-700 rounded w-24 ml-auto"></div></TableCell>
                                    <TableCell className="text-center"><div className="h-8 bg-slate-700 rounded w-20 mx-auto"></div></TableCell>
                                </TableRow>
                            ))
                        ) : invoices.length > 0 ? (
                            invoices.map((invoice) => (
                                <TableRow key={invoice.id} className="border-white/10 hover:bg-white/5">
                                    <TableCell className="font-mono text-slate-300">{invoice.id}</TableCell>
                                    <TableCell className="font-medium">{invoice.customer}</TableCell>
                                    <TableCell className="text-right font-medium text-green-400">{invoice.amount}</TableCell>
                                    <TableCell className="text-center">{getStatusBadge(invoice.status)}</TableCell>
                                    <TableCell className="text-right text-slate-300">{invoice.dueDate}</TableCell>
                                    <TableCell className="text-center">
                                        {invoice.status === 'Funded' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-green-500/50 bg-green-500/10 text-green-400 hover:bg-green-500/20 hover:text-green-300"
                                                onClick={() => handleRepay(invoice.id)}
                                            >
                                                Repay
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                                    <Inbox className="h-12 w-12 mx-auto mb-4" />
                                    No invoices found.
                                    {!isConnected && " Please connect your wallet to view your invoices."}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}