// import axios from 'axios';

// // A simple in-memory cache to store tokens for 1 hour
// const cache = {
//     tokens: null,
//     lastFetch: 0,
//     cacheDuration: 3600 * 1000, // 1 hour in milliseconds
// };

// export async function getSupportedTokens() {
//     const now = Date.now();
//     if (cache.tokens && (now - cache.lastFetch < cache.cacheDuration)) {
//         console.log("Serving tokens from cache.");
//         return cache.tokens;
//     }

//     console.log("Fetching fresh token list from 1inch API...");
//     const apiUrl = `https://api.1inch.dev/swap/v5.2/1/tokens`; // Chain ID 1 for Ethereum Mainnet

//     const response = await axios.get(apiUrl, {
//         headers: { "Authorization": `Bearer ${process.env.ONEINCH_API_KEY}` }
//     });

//     const allTokens = Object.values(response.data.tokens);
//     cache.lastFetch = now;
    
//     return allTokens;
// }

const getSupportedTokens = [
    { symbol: 'USDC', address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' },
    { symbol: 'DAI', address: '0x3e622317f8C93f7328350cF0B56d9eD4C620C5d6' },
    { symbol: 'ETH', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' },
];

export default getSupportedTokens