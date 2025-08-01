'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Inbox } from 'lucide-react';
import { ethers, BrowserProvider } from 'ethers';
import vaultManagerABI from '@/lib/vaulltManager';
import { toast } from 'sonner';

const explorer = 'https://sepolia.etherscan.io/';
const VAULT_MANAGER_ADDRESS = '0xYourVaultManagerAddress'; // <- replace with actual contract address

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

interface Props {
  invoices: Invoice[];
  getStatusBadge: (status: Invoice['status']) => JSX.Element;
}

export default function InvoiceTableCard({ invoices, getStatusBadge }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function repayInvoice(tokenId: string) {
    try {
      if (!window.ethereum) throw new Error('No wallet detected');

      setLoadingId(tokenId);

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        VAULT_MANAGER_ADDRESS,
        vaultManagerABI,
        signer
      );

      const tx = await contract.repayInvoice(tokenId);
      await tx.wait();

      toast.success('Repayment successful!');
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Repayment failed.');
    } finally {
      setLoadingId(null);
    }
  }

  if (!invoices?.length)
    return (
      <div className="flex items-center justify-center text-slate-500 border border-white/10 p-6 rounded-lg bg-white/5">
        <Inbox className="mr-2 w-5 h-5" /> No invoices yet.
      </div>
    );

  return (
    <div className="overflow-x-auto bg-white/5 p-4 rounded-lg border border-white/10">
      <table className="min-w-full text-sm text-white">
        <thead className="bg-slate-800 text-slate-400">
          <tr>
            <th className="p-3 text-left">Invoice ID</th>
            <th className="p-3 text-left">Customer</th>
            <th className="p-3 text-left">Amount</th>
            <th className="p-3 text-left">Token</th>
            <th className="p-3 text-left">Tx</th>
            <th className="p-3 text-left">File</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {invoices.map((inv) => (
            <tr key={inv.id}>
              <td className="p-3">{inv.id}</td>
              <td className="p-3">{inv.customerName}</td>
              <td className="p-3">${Number(inv.invoiceAmount).toLocaleString()}</td>
              <td className="p-3">{inv.preferredTokenSymbol}</td>
              <td className="p-3">
                <a
                  href={`${explorer}/${inv.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-400"
                >
                  View
                </a>
              </td>
              <td className="p-3">
                <a
                  href={`https://ipfs.io/ipfs/${inv.ipfsHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-purple-400"
                >
                  PDF
                </a>
              </td>
              <td className="p-3">{getStatusBadge(inv.status)}</td>
              <td className="p-3">
                {inv.status === 'Funded' ? (
                  <button
                    className={`bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded ${
                      loadingId === inv.id ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={loadingId === inv.id}
                    onClick={() => repayInvoice(inv.id)}
                  >
                    {loadingId === inv.id ? 'Processing...' : 'Repay'}
                  </button>
                ) : inv.status === 'Repaid' ? (
                  <span className="text-green-400 text-xs font-semibold">Repaid</span>
                ) : (
                  <button
                    disabled
                    className="bg-gray-600 text-white text-xs px-3 py-1 rounded opacity-40 cursor-not-allowed"
                  >
                    Pending
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
