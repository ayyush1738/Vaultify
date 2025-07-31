// components/InvoiceTableCard.tsx

import { Badge } from '@/components/ui/badge';
import { Inbox } from 'lucide-react';

const explorer = 'https://explorer.zksync.io/tx';

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

// FIX: Add getStatusBadge to the Props interface
interface Props {
  invoices: Invoice[];
  getStatusBadge: (status: Invoice['status']) => JSX.Element;
}

// FIX: Destructure the getStatusBadge prop
export default function InvoiceTableCard({ invoices, getStatusBadge }: Props) {
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
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Tx</th>
            <th className="p-3 text-left">File</th>
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
                {/* FIX: Use the getStatusBadge prop here */}
                {getStatusBadge(inv.status)}
              </td>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}