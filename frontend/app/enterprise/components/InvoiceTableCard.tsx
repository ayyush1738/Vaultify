// components/InvoiceTableCard.tsx
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Inbox } from 'lucide-react';
import React from 'react';

interface Invoice {
  id: string;
  fileName: string;
  amount: string;
  customer: string;
  dueDate: string;
  status: 'Funded' | 'Pending Funding' | 'Repaid';
  uploadDate: string;
}

interface Props {
  invoices: Invoice[];
  isLoading: boolean;
  onRepay: (id: string) => void;
}

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

const InvoiceTableCard: React.FC<Props> = ({ invoices, isLoading, onRepay }) => {
  return (
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
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i} className="border-white/10 animate-pulse">
                  <TableCell><div className="h-4 bg-slate-700 rounded w-20" /></TableCell>
                  <TableCell><div className="h-4 bg-slate-700 rounded w-24" /></TableCell>
                  <TableCell className="text-right"><div className="h-4 bg-slate-700 rounded w-16 ml-auto" /></TableCell>
                  <TableCell className="text-center"><div className="h-6 bg-slate-700 rounded w-20 mx-auto" /></TableCell>
                  <TableCell className="text-right"><div className="h-4 bg-slate-700 rounded w-24 ml-auto" /></TableCell>
                  <TableCell className="text-center"><div className="h-8 bg-slate-700 rounded w-20 mx-auto" /></TableCell>
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
                        onClick={() => onRepay(invoice.id)}
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
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default InvoiceTableCard;
