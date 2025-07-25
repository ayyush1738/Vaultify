'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  Copy, 
  ExternalLink, 
  ChevronDown,
  Circle,
  Power
} from 'lucide-react';

interface WalletConnectorProps {
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
}

export function WalletConnector({ isConnected, setIsConnected }: WalletConnectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  
  // Mock wallet data
  const walletAddress = '0x742d35Cc6634C0532925a3b8D6A4b3C9d';
  const ensName = 'vaultify.eth';
  const balance = '2.5 ETH';
  const chainName = 'Ethereum';

  const walletProviders = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: '🦊',
      description: 'Connect using browser wallet'
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: '🔗',
      description: 'Scan with WalletConnect to connect'
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: '🔵',
      description: 'Connect to your Coinbase Wallet'
    }
  ];

  const handleConnect = (walletId: string) => {
    setSelectedWallet(walletId);
    // Simulate connection process
    setTimeout(() => {
      setIsConnected(true);
      setIsOpen(false);
    }, 1000);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setSelectedWallet(null);
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
  };

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm text-slate-300">{chainName}</span>
          </div>
          <div className="text-sm text-white font-medium">{balance}</div>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Wallet className="h-4 w-4 mr-2" />
              {ensName || shortenAddress(walletAddress)}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Wallet Details</DialogTitle>
              <DialogDescription className="text-slate-400">
                Your connected wallet information
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div>
                  <div className="text-sm text-slate-400">Address</div>
                  <div className="font-mono text-sm">{shortenAddress(walletAddress)}</div>
                </div>
                <Button variant="ghost" size="sm" onClick={copyAddress}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div>
                  <div className="text-sm text-slate-400">Balance</div>
                  <div className="text-lg font-semibold">{balance}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Circle className="w-2 h-2 fill-green-400 text-green-400" />
                  <span className="text-sm text-green-400">{chainName}</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
                onClick={handleDisconnect}
              >
                <Power className="h-4 w-4 mr-2" />
                Disconnect Wallet
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
          <Wallet className="h-4 w-4 mr-2" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription className="text-slate-400">
            Choose your preferred wallet to connect to Vaultify
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-3">
          {walletProviders.map((provider) => (
            <Card 
              key={provider.id}
              className="bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer transition-all duration-200"
              onClick={() => handleConnect(provider.id)}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="text-2xl">{provider.icon}</div>
                <div className="flex-1">
                  <div className="font-medium text-white">{provider.name}</div>
                  <div className="text-sm text-slate-400">{provider.description}</div>
                </div>
                {selectedWallet === provider.id && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-xs text-slate-400 text-center mt-4">
          By connecting a wallet, you agree to Vaultify's Terms of Service and acknowledge you have read and understand the protocol disclaimer.
        </div>
      </DialogContent>
    </Dialog>
  );
}