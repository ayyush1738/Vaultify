'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers, BrowserProvider } from 'ethers';
import { useAccount, useWalletClient } from 'wagmi';
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
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

// Replace with your Sepolia (or testnet) USDC contract address
const USDC_CONTRACT_ADDRESS = '0x65aFADD39029741B3b8f0756952C74678c9cEC93';

const ERC20_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function decimals() view returns (uint8)',
];

type Invoice = {
  id: string;
  customerName: string;
  invoiceAmount: number;
  fundingAmount: number;
  repaymentAmount: number;
  preferredTokenSymbol: string;
  status: 'Pending Funding' | 'Funded' | 'Repaid';
  dueDate: string;
  yieldPercent: string;
};

export default function InvestorDashboard() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [approvalDone, setApprovalDone] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL;
  const VAULT_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_VAULT_MANAGER_ADDRESS || '';

  const balances = { USDC: 1250.0 }; // Dummy balance, replace with real balance if you want
  const selectedToken = 'USDC';

  // Create ethers provider/signer from wagmi walletClient
  const provider = walletClient ? new BrowserProvider(walletClient) : undefined;

  // Get signer (async call)
  const getSigner = async () => {
    if (!provider) return undefined;
    return provider.getSigner();
  };

  // Fetch available invoices from your backend
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
        headers: { Authorization: `Bearer ${token}` },
      });

      const filteredInvoices = res.data.invoices
        .filter((inv: any) => inv.preferred_token_symbol === 'USDC')
        .map((inv: any) => {
          const fundingAmount = Number(inv.funded_amount);
          const repaymentAmount = Number(inv.invoice_amount);
          const invoiceAmount = Number(inv.invoice_amount);
          let yieldPercent = '0%';

          if (!isNaN(fundingAmount) && !isNaN(repaymentAmount) && fundingAmount > 0) {
            const yieldRatio = ((repaymentAmount - fundingAmount) / fundingAmount) * 100;
            yieldPercent = yieldRatio.toFixed(2) + '%';
          }

          return {
            id: String(inv.id),
            customerName: inv.customer_name,
            invoiceAmount,
            fundingAmount,
            repaymentAmount,
            preferredTokenSymbol: inv.preferred_token_symbol,
            status: 'Pending Funding',
            dueDate: new Date(inv.due_date).toLocaleDateString(),
            yieldPercent,
          };
        });

      setInvoices(filteredInvoices);
      if (!selectedInvoiceId && filteredInvoices.length > 0) {
        setSelectedInvoiceId(filteredInvoices[0].id);
      }
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

  const selectedInvoice = invoices.find((inv) => inv.id === selectedInvoiceId);
  const depositAmount = selectedInvoice?.fundingAmount.toString() || '';

  // Check allowance of VaultManager contract to spend user's USDC
  const checkAllowance = async (signer: ethers.Signer) => {
    if (!address || !selectedInvoice) return false;
    try {
      const usdcContract = new ethers.Contract(USDC_CONTRACT_ADDRESS, ERC20_ABI, signer);
      const allowance = await usdcContract.allowance(address, VAULT_MANAGER_ADDRESS);
      const decimals = 6;
      const requiredAllowance = ethers.parseUnits(depositAmount, decimals);
      return allowance.gte(requiredAllowance);
    } catch (err) {
      console.error('Error checking allowance:', err);
      return false;
    }
  };

  // Approve VaultManager contract to spend USDC tokens on behalf of user
  const approveUSDC = async () => {
    if (!address || !selectedInvoice) {
      alert('Connect wallet and select an invoice first.');
      return;
    }
    setIsApproving(true);
    try {
      const signer = await getSigner();
      if (!signer) {
        alert('Cannot get signer. Please reconnect wallet.');
        setIsApproving(false);
        return;
      }
      const usdcContract = new ethers.Contract(USDC_CONTRACT_ADDRESS, ERC20_ABI, signer);
      const decimals = 6;
      const amountToApprove = ethers.parseUnits(depositAmount, decimals);
      const tx = await usdcContract.approve(VAULT_MANAGER_ADDRESS, amountToApprove);
      await tx.wait();
      setApprovalDone(true);
      alert('✅ USDC approved successfully!');
    } catch (err: any) {
      console.error('Approval failed:', err);
      alert('❌ Approval failed: ' + (err.message || err));
    } finally {
      setIsApproving(false);
    }
  };

  const verifyAllowance = async () => {
    const signer = await getSigner();
    if (!signer || !address || !selectedInvoice) return false;
    const usdcContract = new ethers.Contract(USDC_CONTRACT_ADDRESS, ERC20_ABI, signer);
    const allowance = await usdcContract.allowance(address, VAULT_MANAGER_ADDRESS);
    const required = ethers.parseUnits(selectedInvoice.fundingAmount.toString(), 6);
    return allowance.gte(required);
  };
  // Handle funding invoice call to your backend API
  const handleDeposit = async () => {
    if (!depositAmount || !address || !API_BASE || !selectedInvoice) {
      alert('Please connect wallet and select an invoice.');
      return;
    }
    if (!approvalDone) {
      alert('Please approve USDC spending before funding.');
      return;
    }
    const token = localStorage.getItem('jwt');
    if (!token) {
      alert('Please login to continue.');
      return;
    }
    try {
      const res = await axios.post(
        `${API_BASE}/api/v1/investor/fund/${selectedInvoice.id}`,
        {
          amount: depositAmount,
          tokenSymbol: selectedToken,
          investorAddress: address,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success) {
        alert('✅ Successfully funded invoice.');
        setApprovalDone(false); // reset for next funding
        fetchInvoices();
      } else {
        throw new Error(res.data.message || 'Failed to fund.');
      }
    } catch (err: any) {
      console.error('Funding error:', err);
      alert('❌ Failed to fund: ' + (err?.response?.data?.message || err.message));
    }
  };

  // Status badge component
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
            Investor Dashboard (USDC Only)
          </div>
        </div>
        <ConnectButton />
      </nav>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Invoice Select */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Select Invoice to Fund (USDC)</CardTitle>
            <CardDescription className="text-slate-300">
              Choose an invoice to fund with USDC
            </CardDescription>
          </CardHeader>
          <CardContent>
            <select
              className="w-full bg-white/5 border-white/10 text-white p-2 rounded"
              value={selectedInvoiceId || ''}
              onChange={(e) => {
                setSelectedInvoiceId(e.target.value || null);
                setApprovalDone(false); // Reset approval when invoice changes
              }}
            >
              {invoices.length > 0 ? (
                invoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.id} - {inv.customerName} - ${inv.invoiceAmount.toLocaleString()}
                  </option>
                ))
              ) : (
                <option disabled value="">
                  No pending USDC invoices available
                </option>
              )}
            </select>
          </CardContent>
        </Card>

        {/* Deposit Form */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Deposit to Fund Invoice</CardTitle>
            <CardDescription className="text-slate-300">
              Funding amount is fixed at 98% of invoice amount, paid in USDC
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-slate-300">
                Amount to Deposit (USDC)
              </Label>
              <Input
                id="amount"
                type="number"
                value={depositAmount}
                readOnly
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
              />
              <div className="text-xs text-slate-400">
                Available: {balances.USDC.toLocaleString()} USDC
              </div>
            </div>

            {selectedInvoice && (
              <div className="text-slate-300 text-sm">
                Estimated Yield: <strong>{selectedInvoice.yieldPercent}</strong>
                <br />
                Repayment Amount after Due Date: ${selectedInvoice.repaymentAmount.toLocaleString()}
              </div>
            )}

            {!approvalDone && (
              <Button
                onClick={approveUSDC}
                className="w-full mb-3 bg-yellow-600 hover:bg-yellow-700 text-white"
                disabled={isApproving || !isConnected || !provider || !selectedInvoice}
              >
                {isApproving ? 'Approving...' : 'Approve USDC Spending'}
              </Button>
            )}

            <Button
              onClick={handleDeposit}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              disabled={!depositAmount || !isConnected || !selectedInvoice || !approvalDone}
            >
              Fund Invoice
            </Button>
          </CardContent>
        </Card>

        {/* Invoice Table */}
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
                <th className="p-3 text-left">% Yield</th>
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
