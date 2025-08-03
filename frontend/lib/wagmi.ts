// lib/wagmi.ts
'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  mainnet,
  sepolia,
  polygon,
  optimism,
  arbitrum,
  base,
  Chain,
} from 'wagmi/chains';

// Monad Testnet config (unchanged)
const monadTestnet: Chain = {
  id: 8081,
  name: 'Monad Testnet',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://devnet.monad.xyz'] },
    public: { http: ['https://devnet.monad.xyz'] },
  },
  blockExplorers: {
    default: {
      name: 'MonadScan',
      url: 'https://explorer.devnet.monad.xyz',
    },
  },
  testnet: true,
};

// Monad Mainnet config (updated chain ID and RPC URL)
const monadMainnet: Chain = {
  id: 10143,
  name: 'Monad Mainnet',
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc.monad.xyz'] },
    public: { http: ['https://rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: {
      name: 'MonadScan',
      url: 'https://explorer.monad.xyz',
    },
  },
  testnet: false,
};

// WalletConnect Project ID from environment variables
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error('NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID is not set in environment variables');
}

export const config = getDefaultConfig({
  appName: 'My dApp',
  projectId,
  // Include both Monad Testnet and Monad Mainnet
  chains: [mainnet, sepolia, monadTestnet, monadMainnet, polygon, optimism, arbitrum, base],
  ssr: true,
});
