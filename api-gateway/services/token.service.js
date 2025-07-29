import axios from 'axios';

// A simple in-memory cache to store tokens for 1 hour
const cache = {
    tokens: null,
    lastFetch: 0,
    cacheDuration: 3600 * 1000, // 1 hour in milliseconds
};

// Define the tokens your platform officially supports by their symbol
const SUPPORTED_SYMBOLS = ['USDC', 'DAI', 'WETH', 'WBTC'];

export async function getSupportedTokens() {
    const now = Date.now();
    if (cache.tokens && (now - cache.lastFetch < cache.cacheDuration)) {
        console.log("Serving tokens from cache.");
        return cache.tokens;
    }

    console.log("Fetching fresh token list from 1inch API...");
    const apiUrl = `https://api.1inch.dev/token/v1.2/1`; // Chain ID 1 for Ethereum Mainnet

    const response = await axios.get(apiUrl, {
        headers: { "Authorization": `Bearer ${process.env.ONEINCH_API_KEY}` }
    });

    const allTokens = Object.values(response.data.tokens);

    // Filter the massive list down to only the tokens we support
    const supportedTokens = allTokens.filter(token => SUPPORTED_SYMBOLS.includes(token.symbol));

    // Update the cache
    cache.tokens = supportedTokens;
    cache.lastFetch = now;
    
    return supportedTokens;
}