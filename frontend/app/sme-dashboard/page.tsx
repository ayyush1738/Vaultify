'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { WalletConnector } from '@/components/wallet-connector';
import { ThemeToggle } from '@/components/theme-toggle';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  Camera, 
  CheckCircle,
  Clock,
  DollarSign,
  Eye
} from 'lucide-react';
import Link from 'next/link';

export default function SMEDashboard() {
  const [isConnected, setIsConnected] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [extractedMetadata, setExtractedMetadata] = useState<any>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Mock previous invoices data
  const previousInvoices = [
    {
      id: '#INV-001',
      fileName: 'invoice_001.pdf',
      amount: '$2,500',
      customer: 'TechCorp Ltd.',
      status: 'Funded',
      uploadDate: '2025-01-15',
      fundingDate: '2025-01-16'
    },
    {
      id: '#INV-002',
      fileName: 'invoice_002.jpg',
      amount: '$1,800',
      customer: 'Green Energy Co.',
      status: 'Pending Funding',
      uploadDate: '2025-01-20',
      fundingDate: '-'
    },
    {
      id: '#INV-003',
      fileName: 'invoice_003.pdf',
      amount: '$3,200',
      customer: 'BuildTech Inc.',
      status: 'Repaid',
      uploadDate: '2025-01-10',
      fundingDate: '2025-01-11'
    }
  ];

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        setSelectedFile(file);
        // Simulate metadata extraction
        simulateMetadataExtraction(file);
      }
    }
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      simulateMetadataExtraction(file);
    }
  };

  const simulateMetadataExtraction = (file: File) => {
    // Simulate API call to OCR + IPFS service
    setTimeout(() => {
      const mockMetadata = {
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        invoiceNumber: 'INV-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
        amount: '$' + (Math.random() * 5000 + 1000).toFixed(2),
        currency: 'USD',
        issueDate: '2025-01-25',
        dueDate: '2025-02-25',
        customerName: 'Sample Customer Inc.',
        customerAddress: '123 Business St, City, State 12345',
        description: 'Professional services rendered',
        ipfsHash: 'Qm' + Math.random().toString(36).substring(2, 15),
        extractedText: 'Invoice details extracted successfully...'
      };
      setExtractedMetadata(mockMetadata);
    }, 2000);
  };

  const handleMintNFT = () => {
    if (selectedFile && extractedMetadata) {
      // Simulate NFT minting process
      console.log('Minting NFT for invoice:', extractedMetadata.invoiceNumber);
      // Add to uploaded files
      setUploadedFiles(prev => [...prev, selectedFile]);
      // Reset form
      setSelectedFile(null);
      setExtractedMetadata(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Funded':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Funded</Badge>;
      case 'Pending Funding':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending Funding</Badge>;
      case 'Repaid':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Repaid</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
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
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <WalletConnector isConnected={isConnected} setIsConnected={setIsConnected} />
        </div>
      </nav>

      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* File Upload Section */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Upload Invoice</CardTitle>
              <CardDescription className="text-slate-300">
                Upload your invoice as PDF or image to convert it into an NFT
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Drag and Drop Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                  isDragOver 
                    ? 'border-purple-400 bg-purple-400/10' 
                    : 'border-white/20 hover:border-white/40'
                }`}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
              >
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
                      <p className="text-slate-400 text-sm">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    {extractedMetadata ? (
                      <div className="flex items-center justify-center text-green-400">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Metadata extracted successfully
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
                    <div>
                      <p className="text-white font-medium">Drop your invoice here</p>
                      <p className="text-slate-400 text-sm">or click to browse files</p>
                    </div>
                  </div>
                )}
              </div>

              {/* File Input */}
              <div>
                <Label htmlFor="file-upload" className="text-slate-300">
                  Select File
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleFileSelect}
                  className="bg-white/5 border-white/10 text-white file:bg-purple-600 file:text-white file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Supported formats: PDF, JPG, PNG, JPEG (Max 10MB)
                </p>
              </div>

              {/* Mint NFT Button */}
              <Button 
                onClick={handleMintNFT}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                disabled={!selectedFile || !extractedMetadata || !isConnected}
              >
                <FileText className="mr-2 h-4 w-4" />
                Mint Invoice NFT
              </Button>
            </CardContent>
          </Card>

          {/* Metadata Preview */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Extracted Metadata</CardTitle>
              <CardDescription className="text-slate-300">
                Preview of the extracted invoice information
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
                    <p className="text-white font-medium">{extractedMetadata.customerName}</p>
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
                  Upload an invoice to see extracted metadata
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Previous Invoices Table */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Your Invoices</CardTitle>
            <CardDescription className="text-slate-300">
              Track the status of your uploaded invoices
            </CardDescription>
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
                {previousInvoices.map((invoice) => (
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