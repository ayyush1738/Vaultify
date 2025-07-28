'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { 
  ArrowLeft, 
  Wallet, 
  TrendingUp, 
  DollarSign
} from 'lucide-react';
import Link from 'next/link';

export default function InvestorDashboard() {
  const [isConnected, setIsConnected] = useState(true);
  const [selectedToken, setSelectedToken] = useState('ETH');
  const [depositAmount, setDepositAmount] = useState('');
  
  // Mock data
  const balances = {
    ETH: '2.5',
    USDC: '1,250.00'
  };

  const vaultStats = {
    lpTokens: '1,847.32',
    estimatedAPY: '12.4%',
    totalDeposited: '$4,680.00'
  };

  const activeInvoices = [
    {
      id: '#INV-001',
      company: 'TechCorp Ltd.',
      amount: '$2,500',
      status: 'Funded',
      dueDate: '2025-02-15',
      yield: '8.5%'
    },
    {
      id: '#INV-002',
      company: 'Green Energy Co.',
      amount: '$1,800',
      status: 'Pending',
      dueDate: '2025-02-20',
      yield: '9.2%'
    },
    {
      id: '#INV-003',
      company: 'BuildTech Inc.',
      amount: '$3,200',
      status: 'Repaid',
      dueDate: '2025-01-30',
      yield: '7.8%'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Funded':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Funded</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
      case 'Repaid':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Repaid</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleDeposit = () => {
    // Handle deposit logic here
    console.log(`Depositing ${depositAmount} ${selectedToken}`);
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
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Investor Dashboard
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </nav>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Wallet Balance Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">ETH Balance</CardTitle>
              <Wallet className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{balances.ETH} ETH</div>
              <p className="text-xs text-slate-400">≈ $4,125.00</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">USDC Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{balances.USDC} USDC</div>
              <p className="text-xs text-slate-400">≈ $1,250.00</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">LP Tokens</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{vaultStats.lpTokens}</div>
              <p className="text-xs text-slate-400">Total staked</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Estimated APY</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{vaultStats.estimatedAPY}</div>
              <p className="text-xs text-slate-400">Historical average</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Deposit Form */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Deposit into Vault</CardTitle>
              <CardDescription className="text-slate-300">
                Deposit ETH or USDC to start earning yield from invoice funding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="token" className="text-slate-300">Token</Label>
                <Select value={selectedToken} onValueChange={setSelectedToken}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select token" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/10">
                    <SelectItem value="ETH">ETH - Ethereum</SelectItem>
                    <SelectItem value="USDC">USDC - USD Coin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-slate-300">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.0"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                />
                <div className="text-xs text-slate-400">
                  Available: {selectedToken === 'ETH' ? balances.ETH : balances.USDC} {selectedToken}
                </div>
              </div>

              <Button 
                onClick={handleDeposit}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                disabled={!depositAmount || !isConnected}
              >
                Deposit into Vault
              </Button>
            </CardContent>
          </Card>

          {/* Vault Summary */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Your Vault Summary</CardTitle>
              <CardDescription className="text-slate-300">
                Overview of your current positions and earnings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10">
                <div>
                  <div className="text-sm text-slate-400">Total Deposited</div>
                  <div className="text-2xl font-bold text-white">{vaultStats.totalDeposited}</div>
                </div>
                <DollarSign className="h-8 w-8 text-green-400" />
              </div>

              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10">
                <div>
                  <div className="text-sm text-slate-400">LP Tokens Held</div>
                  <div className="text-2xl font-bold text-white">{vaultStats.lpTokens}</div>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-400" />
              </div>

              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10">
                <div>
                  <div className="text-sm text-slate-400">Current APY</div>
                  <div className="text-2xl font-bold text-white">{vaultStats.estimatedAPY}</div>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Invoices Table */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 mt-8">
          <CardHeader>
            <CardTitle className="text-white">Active Funded Invoices</CardTitle>
            <CardDescription className="text-slate-300">
              Track the status of invoices you've helped fund
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-slate-300">Invoice ID</TableHead>
                  <TableHead className="text-slate-300">Company</TableHead>
                  <TableHead className="text-slate-300">Amount</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Due Date</TableHead>
                  <TableHead className="text-slate-300">Yield</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="text-white font-medium">{invoice.id}</TableCell>
                    <TableCell className="text-slate-300">{invoice.company}</TableCell>
                    <TableCell className="text-white">{invoice.amount}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell className="text-slate-300">{invoice.dueDate}</TableCell>
                    <TableCell className="text-green-400 font-medium">{invoice.yield}</TableCell>
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