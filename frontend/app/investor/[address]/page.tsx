'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

// Updated Invoice type to match UI expectations
type Invoice = {
  id: string;
  customerName: string;
  invoiceAmount: string;
  preferredTokenSymbol: string;
  status: 'Pending Funding' | 'Funded' | 'Repaid';
  dueDate: string;
  yieldPercent: string;
};

export default function InvestorDashboard() {
  const { address, isConnected } = useAccount();
  const [selectedToken, setSelectedToken] = useState('ETH');
  const [depositAmount, setDepositAmount] = useState('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  // Wallet info (mock)
  const balances = {
    ETH: '2.5',
    USDC: '1250.00',
  };

  const vaultStats = {
    lpTokens: '1,847.32',
    estimatedAPY: '12.4%',
    totalDeposited: '$4,680.00',
  };

  // 🧠 FIXED: Map API fields to match Invoice type
  const fetchInvoices = async () => {
    if (!address || !API_BASE) {
      setIsLoadingInvoices(false);
      setInvoices([]);
      return;
    }
    setIsLoadingInvoices(true);
    try {
      const token = localStorage.getItem('jwt') || '';
      const res = await axios.get(`${API_BASE}/api/v1/investor/available`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const mapped = res.data.invoices.map((inv: any) => ({
        id: String(inv.id),
        customerName: inv.customer_name,
        invoiceAmount: inv.invoice_amount,
        preferredTokenSymbol: inv.preferred_token_symbol,
        status: 'Pending Funding', // you can update this based on real logic
        dueDate: '', // if not provided by backend
        yieldPercent: '', // optional placeholder
      }));

      setInvoices(mapped);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch invoices:', err?.response?.data || err?.message || err);
      setError('Failed to load invoices.');
      setInvoices([]);
    } finally {
      setIsLoadingInvoices(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [address, API_BASE]);

  const handleDeposit = () => {
    console.log(`Depositing ${depositAmount} ${selectedToken}`);
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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
        <ConnectButton />
      </nav>

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
                <Label htmlFor="token" className="text-slate-300">
                  Token
                </Label>
                <Select
                  value={selectedToken}
                  onValueChange={(value) => setSelectedToken(value)}
                >
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
                <Label htmlFor="amount" className="text-slate-300">
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.0"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                />
                <div className="text-xs text-slate-400">
                  Available: {selectedToken === 'ETH' ? balances.ETH : balances.USDC}{' '}
                  {selectedToken}
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

      <div className="p-6 max-w-7xl mx-auto">
        {/* Table */}
        <table className="min-w-full text-sm text-white">
          <thead className="bg-slate-800 text-slate-400">
            <tr>
              <th className="p-3 text-left">Invoice ID</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Due Date</th>
              <th className="p-3 text-left">%Yield</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="p-3">{inv.id}</td>
                <td className="p-3">{inv.customerName}</td>
                <td className="p-3">{Number(inv.invoiceAmount).toLocaleString()}</td>
                <td className="p-3">{getStatusBadge(inv.status)}</td>
                <td className="p-3">{inv.dueDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
