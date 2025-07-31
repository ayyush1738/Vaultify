import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const ONE_INCH_API_KEY = process.env.NEXT_PUBLIC_ONE_INCH_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { chainId } = req.query;

    if (!chainId || Array.isArray(chainId)) {
        return res.status(400).json({ error: 'Missing or invalid chainId' });
    }

    if (!ONE_INCH_API_KEY) {
        return res.status(500).json({ error: 'Missing 1inch API key' });
    }

    try {
        const response = await axios.get(`https://api.1inch.dev/token/v1.2/${chainId}`, {
            headers: {
                Authorization: `Bearer ${ONE_INCH_API_KEY}`,
            },
        });

        res.status(200).json(response.data);
    } catch (err: any) {
        console.error('[1inch API error]', err?.response?.data || err.message);
        res.status(err.response?.status || 500).json({
            error: 'Failed to fetch token list',
            details: err?.response?.data || err.message,
        });
    }
}
