// services/oneInchService.js
import axios from 'axios';
import 'dotenv/config';

const API_KEY = process.env.ONEINCH_API_KEY;
const ONEINCH_BASE_URL = 'https://api.1inch.dev';

// A helper to create standardized headers
const getApiHeaders = () => {
  if (!API_KEY) {
    // This will stop the server startup if the key is missing, which is good practice.
    throw new Error("FATAL: 1inch API Key (ONEINCH_API_KEY) is not configured in .env file.");
  }
  return {
    "Authorization": `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  };
};

/**
 * Broadcasts a raw, signed EVM transaction to the network via the 1inch Tx-Gateway.
 * This is ideal for sponsoring gas fees for your users.
 * @param {number} chainId The chain ID (e.g., 1 for Ethereum, 137 for Polygon).
 * @param {string} rawTransaction The raw, signed transaction hex string (prefixed with 0x).
 * @returns {Promise<{ transactionHash: string }>} The response from the 1inch API, containing the transaction hash.
 */
export async function broadcastTransaction(chainId, rawTransaction) {
  const url = `${ONEINCH_BASE_URL}/tx-gateway/v1.1/${chainId}/broadcast`;
  console.log(`Broadcasting to 1inch: ${url}`);

  try {
    const response = await axios.post(
      url,
      { rawTransaction }, // The body must be a JSON object with this key
      { headers: getApiHeaders() }
    );
    // The response data should be an object like { transactionHash: '0x...' }
    return response.data;
  } catch (error) {
    // Provide detailed error feedback for easier debugging
    const errorDetails = error.response?.data?.description || error.message;
    console.error(`❌ 1inch Broadcast Error: ${errorDetails}`, error.response?.data || '');
    throw new Error(`Failed to broadcast transaction via 1inch: ${errorDetails}`);
  }
}

/**
 * Fetches swap data from the 1inch Swap API.
 * This provides the calldata needed to execute a trade.
 * (Ready for your Investor Dashboard)
 * @param {number} chainId The chain ID for the swap.
 * @param {object} params The swap parameters.
 * @returns {Promise<object>} The full swap data object from 1inch.
 */
export async function getSwapData(chainId, params) {
    const url = `${ONEINCH_BASE_URL}/swap/v6.0/${chainId}/swap`;
    try {
        const response = await axios.get(url, {
            headers: getApiHeaders(),
            params: params, // e.g., { src, dst, amount, from, slippage }
        });
        return response.data;
    } catch (error) {
        const errorDetails = error.response?.data?.description || error.message;
        console.error(`❌ 1inch Swap API Error: ${errorDetails}`);
        throw new Error(`Failed to get swap data from 1inch: ${errorDetails}`);
    }
}

// You can continue to add more service functions here as you build out the platform:
// - getQuote(...) for the Price Feed API
// - createLimitOrder(...) for the Limit Order API
// - etc.