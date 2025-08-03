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
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

// Invoice type updated to include fundingAmount and repaymentAmount from backend
type Invoice = {
  id: string;
  customerName: string;
  invoiceAmount: number;     // number, not string for arithmetic
  fundingAmount: number;     // new: what investor must send (98%)
  repaymentAmount: number;   // new: what SME repays (100%)
  preferredTokenSymbol: string;
  status: 'Pending Funding' | 'Funded' | 'Repaid';
  dueDate: string;
  yieldPercent: string; // you can calculate dynamically if needed
};

export default function InvestorDashboard() {
  const { address, isConnected } = useAccount();
  const [selectedToken, setSelectedToken] = useState('ETH');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  
  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  // Wallet info (mock)
  const balances = {
    ETH: 2.5,
    USDC: 1250.0,
  };

  // Fetch invoices with fundingAmount included from backend
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

      const mapped: Invoice[] = res.data.invoices.map((inv: any) => ({
        id: String(inv.id),
        customerName: inv.customer_name,
        invoiceAmount: Number(inv.invoice_amount),
        fundingAmount: Number(inv.funding_amount),       // assuming backend sends this
        repaymentAmount: Number(inv.repayment_amount),   // assuming backend sends this
        preferredTokenSymbol: inv.preferred_token_symbol,
        status: 'Pending Funding',
        dueDate: new Date(inv.due_date).toLocaleDateString(),
        yieldPercent: (((inv.repayment_amount - inv.funding_amount) / inv.funding_amount) * 100).toFixed(2) + '%',
      }));

      setInvoices(mapped);
      setSelectedInvoiceId(mapped.length > 0 ? mapped[0].id : null); // select first invoice by default
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch invoices:', err?.response?.data || err?.message || err);
      setError('Failed to load invoices.');
      setInvoices([]);
      setSelectedInvoiceId(null);
    } finally {
      setIsLoadingInvoices(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [address, API_BASE]);

  // Get invoice object for selected invoice
  const selectedInvoice = invoices.find(inv => inv.id === selectedInvoiceId);

  // Deposit amount is fixed to fundingAmount from selected invoice (read-only)
  const depositAmount = selectedInvoice?.fundingAmount.toString() || '';

  const handleDeposit = async () => {
    if (!depositAmount || !selectedToken || !address || !API_BASE || !selectedInvoice) {
      alert("Please connect wallet and select an invoice/token.");
      return;
    }

    const token = localStorage.getItem("jwt");
    if (!token) {
      alert("Please login to continue.");
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE}/api/v1/investor/fund/${selectedInvoice.id}`,
        {
          amount: depositAmount,
          tokenSymbol: selectedToken,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        alert("✅ Successfully funded invoice.");
        fetchInvoices(); // Refresh the list
      } else {
        throw new Error(res.data.message || "Failed to fund.");
      }
    } catch (err: any) {
      console.error("❌ Funding error:", err);
      alert("❌ Failed to fund: " + (err?.response?.data?.message || err.message));
    }
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 max-w-7xl mx-auto">

        {/* Invoice selector */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Select Invoice to Fund</CardTitle>
            <CardDescription className="text-slate-300">
              Choose an invoice matching your preferred token to fund
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedInvoiceId || undefined}
              onValueChange={setSelectedInvoiceId}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select Invoice" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10 max-h-60 overflow-auto">
                {invoices
                  .filter(inv => inv.preferredTokenSymbol === selectedToken && inv.status === 'Pending Funding')
                  .map((inv) => (
                  <SelectItem key={inv.id} value={inv.id}>
                    {inv.id} - {inv.customerName} - ${inv.invoiceAmount.toLocaleString()}
                  </SelectItem>
                ))}
                {invoices.filter(inv => inv.preferredTokenSymbol === selectedToken && inv.status === 'Pending Funding').length === 0 && (
                  <SelectItem key="none" value="">
                    No pending invoices for {selectedToken}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Deposit Form */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Deposit to Fund Invoice</CardTitle>
            <CardDescription className="text-slate-300">
              Funding amount is fixed at 98% of invoice amount
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="token" className="text-slate-300">
                Token
              </Label>
              <Select
                value={selectedToken}
                onValueChange={(value) => {
                  setSelectedToken(value);
                  // reset selected invoice on token change
                  setSelectedInvoiceId(null);
                }}
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
                Amount to Deposit (required funding amount)
              </Label>
              <Input
                id="amount"
                type="number"
                value={depositAmount}
                readOnly
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
              />
              <div className="text-xs text-slate-400">
                Available: {selectedToken === 'ETH' ? balances.ETH : balances.USDC} {selectedToken}
              </div>
            </div>

            {/* Yield info */}
            {selectedInvoice && (
              <div className="text-slate-300 text-sm">
                Estimated Yield: <strong>{selectedInvoice.yieldPercent}</strong> <br />
                Repayment Amount after Due Date: ${selectedInvoice.repaymentAmount.toLocaleString()}
              </div>
            )}

            <Button
              onClick={handleDeposit}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              disabled={!depositAmount || !isConnected || !selectedInvoice}
            >
              Fund Invoice
            </Button>
          </CardContent>
        </Card>

        {/* Invoice table */}
        <div className="col-span-1 lg:col-span-2 overflow-x-auto">
          <table className="min-w-full text-sm text-white">
            <thead className="bg-slate-800 text-slate-400">
              <tr>
                <th className="p-3 text-left">Invoice ID</th>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-left">Invoice Amount</th>
                <th className="p-3 text-left">Funding Amount</th>
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
                  <td className="p-3">${inv.invoiceAmount.toLocaleString()}</td>
                  <td className="p-3">${inv.fundingAmount.toLocaleString()}</td>
                  <td className="p-3">{getStatusBadge(inv.status)}</td>
                  <td className="p-3">{inv.dueDate}</td>
                  <td className="p-3">{inv.yieldPercent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
