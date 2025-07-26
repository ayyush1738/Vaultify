// lib/wagmi.ts
'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'My dApp',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // ⬅️ Replace with your real ID
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: true,
});
