'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId } from 'wagmi';
import { ArrowLeft, Upload, FileText, Camera, CheckCircle, Clock, Eye, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Invoice {
  id: string;
  fileName: string;
  amount: string;
  customer: string;
  status: 'Funded' | 'Pending Funding' | 'Repaid';
  uploadDate: string;
}

const supportedTokens = [
  { symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6 }, // Mainnet USDC
  { symbol: 'DAI', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18 },
  { symbol: 'ETH', address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', decimals: 18 },
];


export default function SMEDashboard() {
  const { address, isConnected } = useAccount();
  const [selectedToken, setSelectedToken] = useState(supportedTokens[0]);
  const [quoteValue, setQuoteValue] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedMetadata, setExtractedMetadata] = useState<any>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chainId = useChainId();

  const fetchInvoices = useCallback(async () => {
    if (!address) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/invoices?smeAddress=${address}`);
      if (!response.ok) throw new Error('Failed to fetch invoices');
      const data = await response.json();
      setInvoices(data);
    } catch (err: any) {
      setError(err.message);
    }
  }, [address]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  useEffect(() => {
    const fetchQuote = async () => {
      if (!extractedMetadata || !selectedToken || !address) return;

      const amount = parseFloat(extractedMetadata.amount.replace('$', ''));
      const amountWei = (amount * 10 ** selectedToken.decimals).toFixed(0);

      try {
        const response = await fetch(
          `https://api.1inch.dev/swap/v5.2/${chainId}/quote?src=${selectedToken.address}&dst=${selectedToken.address}&amount=${amountWei}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_ONEINCH_API_KEY!}`,
              'Content-Type': 'application/json',
            },
          }
        );
        const data = await response.json();
        if (data.toTokenAmount) {
          setQuoteValue(`${(parseFloat(data.toTokenAmount) / 10 ** selectedToken.decimals).toFixed(2)} ${selectedToken.symbol}`);
        } else {
          setQuoteValue(null);
        }
      } catch (err) {
        console.error('1inch quote fetch failed:', err);
        setQuoteValue(null);
      }
    };

    fetchQuote();
  }, [selectedToken, extractedMetadata, address, chainId]);


  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const mockMetadata = {
        fileName: file.name,
        invoiceNumber: 'INV-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
        amount: '$' + (Math.random() * 5000 + 1000).toFixed(2),
        currency: 'USD',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        customerName: 'Sample Customer Inc.',
        customerAddress: '123 Business St, City, State',
        description: 'Rendered services',
        ipfsHash: 'Qm' + Math.random().toString(36).substring(2, 15),
      };
      setExtractedMetadata(mockMetadata);
    }
  };

  // SMEDashboard.tsx

  // ... imports

  const handleMintNFT = async () => {
    if (!selectedFile || !extractedMetadata || !address || !chainId) {
      setError("A file, connected wallet, and chainId are required to mint.");
      return;
    }

    setIsMinting(true);
    setError(null);

    try {
      // Use FormData for file uploads
      const formData = new FormData();
      formData.append('file', selectedFile); // The key 'file' must match the backend's multer setup
      formData.append('smeAddress', address);
      formData.append('chainId', chainId.toString());
      formData.append(
        'fundingGoal',
        extractedMetadata.amount.replace('$', '') // Send the numerical value
      );
      formData.append('tokenAddress', selectedToken.address);


      // **IMPORTANT**: For now, we will let the backend MOCK the transaction hash.
      // The call to the 1inch API in the backend is commented out in the provided example
      // because it requires a truly signed transaction from the frontend.
      // The backend will generate a fake hash and save to the DB, which is enough for this UI test.

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/invoices/mint`, {
        method: 'POST',
        body: formData, // No 'Content-Type' header needed; the browser sets it for FormData
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Minting failed.');

      // Use the record returned from the backend to update the UI
      const newInvoice = {
        id: result.newInvoiceRecord.id.toString(),
        fileName: selectedFile.name,
        amount: '$' + result.newInvoiceRecord.invoice_amount,
        customer: 'N/A', // Your OCR service doesn't provide this yet
        status: result.newInvoiceRecord.status,
        uploadDate: new Date(result.newInvoiceRecord.created_at).toISOString().split('T')[0],
      };

      setInvoices(prev => [...prev, newInvoice]);
      setSelectedFile(null);
      setExtractedMetadata(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsMinting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Funded':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Funded</Badge>;
      case 'Pending Funding':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
      case 'Repaid':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Repaid</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <nav className="flex items-center justify-between p-6 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            SME Dashboard
          </div>
        </div>
        <ConnectButton />
      </nav>

      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {error && (
          <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Upload Invoice</CardTitle>
              <CardDescription className="text-slate-300">
                Upload your invoice to mint it as an NFT
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${isDragOver ? 'border-purple-400 bg-purple-400/10' : 'border-white/20 hover:border-white/40'}`}>
                {selectedFile ? (
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                      {selectedFile.type === 'application/pdf' ? (
                        <FileText className="h-8 w-8 text-white" />
                      ) : (
                        <Camera className="h-8 w-8 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{selectedFile.name}</p>
                      <p className="text-slate-400 text-sm">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    {extractedMetadata ? (
                      <div className="flex items-center justify-center text-green-400">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Metadata extracted
                      </div>
                    ) : (
                      <div className="flex items-center justify-center text-yellow-400">
                        <Clock className="h-5 w-5 mr-2 animate-spin" />
                        Extracting metadata...
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                      <Upload className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-white font-medium">Drop invoice here</p>
                    <p className="text-slate-400 text-sm">or click to browse</p>
                  </div>
                )}
              </div>

              <Input
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileSelect}
                className="bg-white/5 border-white/10 text-white file:bg-purple-600 file:text-white file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4"
              />
              <p className="text-xs text-slate-400">Supported: PDF, JPG, PNG (Max 10MB)</p>

              <Button
                onClick={handleMintNFT}
                disabled={!selectedFile || !extractedMetadata || !isConnected || isMinting}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                {isMinting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Minting...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Mint Invoice NFT
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
          <div>
            <Label className="text-slate-400">Select Token to Receive</Label>
            <select
              value={selectedToken.symbol}
              onChange={(e) => {
                const token = supportedTokens.find(t => t.symbol === e.target.value);
                if (token) setSelectedToken(token);
              }}
              className="w-full bg-slate-800 text-white p-2 rounded mt-1"
            >
              {supportedTokens.map((token) => (
                <option key={token.symbol} value={token.symbol}>
                  {token.symbol}
                </option>
              ))}
            </select>
          </div>


          {/* Metadata Preview */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Extracted Metadata</CardTitle>
              <CardDescription className="text-slate-300">
                Preview before minting
              </CardDescription>
            </CardHeader>
            <CardContent>
              {extractedMetadata ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-400">Invoice Number</Label>
                      <p className="text-white font-medium">{extractedMetadata.invoiceNumber}</p>
                    </div>
                    <div>
                      <Label className="text-slate-400">Amount</Label>
                      <p className="text-white font-medium">{extractedMetadata.amount}</p>
                    </div>
                    <div>
                      <Label className="text-slate-400">Issue Date</Label>
                      <p className="text-white font-medium">{extractedMetadata.issueDate}</p>
                    </div>
                    <div>
                      <Label className="text-slate-400">Due Date</Label>
                      <p className="text-white font-medium">{extractedMetadata.dueDate}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-400">Customer</Label>
                    <p className="text-white">{extractedMetadata.customerName}</p>
                    <p className="text-slate-400 text-sm">{extractedMetadata.customerAddress}</p>
                  </div>
                  <div>
                    <Label className="text-slate-400">Description</Label>
                    <p className="text-white">{extractedMetadata.description}</p>
                  </div>
                  <div>
                    <Label className="text-slate-400">IPFS Hash</Label>
                    <p className="text-white font-mono text-sm break-all">{extractedMetadata.ipfsHash}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  Upload an invoice to preview
                </div>
              )}
            </CardContent>
          </Card>
          {quoteValue && (
            <div>
              <Label className="text-slate-400">Expected Token Received</Label>
              <p className="text-white font-medium">{quoteValue}</p>
            </div>
          )}

        </div>

        {/* Table */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Your Invoices</CardTitle>
            <CardDescription className="text-slate-300">Track uploaded invoice NFTs</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-slate-300">Invoice ID</TableHead>
                  <TableHead className="text-slate-300">File Name</TableHead>
                  <TableHead className="text-slate-300">Amount</TableHead>
                  <TableHead className="text-slate-300">Customer</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Upload Date</TableHead>
                  <TableHead className="text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="text-white font-medium">{invoice.id}</TableCell>
                    <TableCell className="text-slate-300">{invoice.fileName}</TableCell>
                    <TableCell className="text-white">{invoice.amount}</TableCell>
                    <TableCell className="text-slate-300">{invoice.customer}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell className="text-slate-300">{invoice.uploadDate}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
