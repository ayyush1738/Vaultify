// app/api/quote/route.ts
import { NextRequest } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Our frontend still provides your old param names:
  const fromTokenAddress = searchParams.get('fromTokenAddress');
  const toTokenAddress = searchParams.get('toTokenAddress');
  const amount = searchParams.get('amount');
  const chainId = searchParams.get('chainId') || '1';

  if (!fromTokenAddress || !toTokenAddress || !amount) {
    return new Response(JSON.stringify({ error: 'Missing query parameters' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 1inch v6.1 API requires src, dst, and new base URL; params go in config.params!
  const oneInchUrl = `https://api.1inch.dev/swap/v6.1/1/quote`;

  try {
    const apiKey = process.env.ONEINCH_API_KEY; // Ensure you set this in your .env
    const config = {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      params: {
        src: fromTokenAddress,
        dst: toTokenAddress,
        amount,
      },
      paramsSerializer: { indexes: null },
    };

    const response = await axios.get(oneInchUrl, config);

    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('1inch proxy error:', err.message || err);
    return new Response(JSON.stringify({ error: 'Failed to fetch quote' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
