// app/api/quote/route.ts
import { NextRequest } from 'next/server';
import {useAccount} from 'wagmi';
import axios from 'axios';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Get wallet address from query
  const chainId = searchParams.get('chainId') || '1';
  const {address, isConnected} = useAccount();
  const walletAddress = address;

  if (!walletAddress) {
    return new Response(JSON.stringify({ error: 'Missing walletAddress parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const oneInchUrl = `https://api.1inch.dev/balance/v1.2/1/balances/${walletAddress}`;

  try {
    const apiKey = process.env.ONEINCH_API_KEY;
    if (!apiKey) throw new Error('Missing ONEINCH_API_KEY in environment');

    const config = {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      params: {},
      paramsSerializer: {
        indexes: null,
      },
    };

    const response = await axios.get(oneInchUrl, config);

    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('1inch balance API error:', err.message || err);
    return new Response(JSON.stringify({ error: 'Failed to fetch balances' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
