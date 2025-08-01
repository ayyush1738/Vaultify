'use client';

import { useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MetadataPreviewCardProps {
    extractedMetadata: any;
    selectedFile: File | null;
    isReadyToMint: boolean;
    setExtractedMetadata: React.Dispatch<React.SetStateAction<any>>;
}

export default function ExtractedMetadata({
    extractedMetadata,
    selectedFile,
    isReadyToMint,
    setExtractedMetadata,
}: MetadataPreviewCardProps) {
    const [customerName, setCustomerName] = useState<string>('');
    const [customerInput, setCustomerInput] = useState<string>('');
    const [dueDate, setDueDate] = useState<string>('');
    const [issueDate, setIssueDate] = useState<string>('');
    const [mintAllowed, setMintAllowed] = useState<boolean>(false);
    const [dateError, setDateError] = useState<string>('');


    const handleSetCustomer = () => {
        if (!customerInput.trim() || !dueDate.trim() || !issueDate.trim()) return;

        const issue = new Date(issueDate);
        const due = new Date(dueDate);

        if (issue >= due) {
            setDateError('Issue date must be before due date.');
            return;
        }

        setCustomerName(customerInput.trim());
        setMintAllowed(true);
        setDateError('');

        setExtractedMetadata((prev: any) => ({
            ...prev,
            customerName: customerInput.trim(),
            dueDate,
            issueDate,
        }));
    };


    return (
        <Card className="lg:col-span-2 bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
                <CardTitle>Metadata Preview</CardTitle>
                <CardDescription className="text-slate-400">
                    Verify extracted data before minting.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {extractedMetadata ? (
                    <div className="space-y-4 text-sm">
                        <div className="flex justify-between items-center">
                            <Label className="text-slate-400">Amount</Label>
                            <p className="font-medium text-lg text-green-400">
                                {extractedMetadata.convertedAmount
                                    ? `${extractedMetadata.convertedAmount} ${extractedMetadata.preferredToken || 'USDC'}`
                                    : `${extractedMetadata.amount} USDC`}
                            </p>

                        </div>
                        <div className="flex justify-between items-center">
                            <Label className="text-slate-400 min-w-24">Issue Date</Label>
                            {!mintAllowed ? (
                                <Input
                                    type="date"
                                    value={issueDate}
                                    onChange={(e) => setIssueDate(e.target.value)}
                                    className="bg-slate-800 w-1/2 border-white/20 text-white"
                                />
                            ) : (
                                <p className="text-white">{issueDate}</p>
                            )}
                        </div>
                        <div className="flex justify-between items-center">
                            <Label className="text-slate-400 min-w-24">Due Date</Label>
                            {!mintAllowed ? (
                                <Input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="bg-slate-800 w-1/2 border-white/20 text-white"
                                />
                            ) : (
                                <p className="text-white">{dueDate}</p>
                            )}
                        </div>
                        <div className="flex justify-between items-center">
                            <Label className="text-slate-400 min-w-24">Customer</Label>
                            {!mintAllowed ? (
                                <Input
                                    value={customerInput}
                                    onChange={(e) => setCustomerInput(e.target.value)}
                                    placeholder="Enter customer name"
                                    className="bg-slate-800 w-1/2 border-white/20 text-white"
                                />
                            ) : (
                                <p className="text-white">{customerName}</p>
                            )}
                        </div>
                        <Button
                            onClick={handleSetCustomer}
                            variant="secondary"
                            className="w-full"
                            disabled={!customerInput.trim() || !dueDate.trim() || !issueDate.trim()}
                        >
                            SET PROPERTIES
                        </Button>
                        {isReadyToMint && mintAllowed ? (
                            <div className="pt-2 mt-2 border-t border-white/10 flex justify-between items-center text-green-400">
                                <CheckCircle className="h-5 w-5" />
                                <p className="font-medium">Ready to Mint</p>
                            </div>
                        ) : (
                            <div className="pt-2 mt-2 border-t border-white/10 flex justify-between items-center text-yellow-400">
                                <AlertCircle className="h-5 w-5" />
                                <p className="font-medium">Enter the customer name to continue</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-14 text-slate-500">
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
    );
}
