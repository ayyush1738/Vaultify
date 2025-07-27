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
} from 'wagmi/chains';

// ✅ Use NEXT_PUBLIC_ prefix to access env variable in client-side code
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string;

export const config = getDefaultConfig({
  appName: 'My dApp',
  projectId, // ✅ Must be a string, and visible to client
  chains: [mainnet, sepolia, polygon, optimism, arbitrum, base],
  ssr: true,
});
