// No changes are needed here. This code is correct.
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
  // The 'req.url' will be http://localhost:3000/api/balances/balance?walletAddress=...
  const { searchParams } = new URL(req.url);

  // This correctly looks for '?walletAddress=' in the URL.
  const walletAddress = searchParams.get('walletAddress');
  const chainId = searchParams.get('chainId') || '1';

  if (!walletAddress) {
    return NextResponse.json({ error: 'Missing walletAddress parameter' }, { status: 400 });
  }

  // The code correctly builds the 1inch URL.
  const oneInchUrl = `https://api.1inch.dev/balance/v1.2/${chainId}/balances/${walletAddress}`;

  try {
    const apiKey = process.env.ONEINCH_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing ONEINCH_API_KEY' }, { status: 500 });
    }

    const response = await axios.get(oneInchUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('1inch balance API error:', error.response?.data || error.message);
    return NextResponse.json({ error: 'Failed to fetch balances' }, { status: 500 });
  }
}