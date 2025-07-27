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
  projectId: '091cfdf5b0df9d7954530bf0bf224197', // ⬅️ Replace with your real ID
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: true,
});
