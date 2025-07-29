import axios from 'axios';

// Native token address for Ethereum
const NATIVE_TOKEN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

export async function getPricesInUSD(tokenAddresses) {
    if (!tokenAddresses || tokenAddresses.length === 0) {
        return {};
    }

    // The 1inch Price API uses the native asset as the base currency for pricing
    const currency = NATIVE_TOKEN_ADDRESS; 

    const apiUrl = `https://api.1inch.dev/price/v1.1/1`; // Chain ID 1 for Ethereum

    const response = await axios.post(apiUrl, 
        {
            tokens: tokenAddresses,
            currency: currency
        },
        {
            headers: { "Authorization": `Bearer ${process.env.ONEINCH_API_KEY}` }
        }
    );

    // The prices are returned relative to ETH. We need the ETH price in USD to convert them.
    const ethPriceInUsdResponse = await axios.get(`${apiUrl}/${NATIVE_TOKEN_ADDRESS}`, {
        headers: { "Authorization": `Bearer ${process.env.ONEINCH_API_KEY}` }
    });
    
    const ethPriceInUsd = parseFloat(ethPriceInUsdResponse.data.price);

    // Convert all prices to USD
    const pricesInUsd = {};
    for (const [address, priceVsEth] of Object.entries(response.data)) {
        pricesInUsd[address] = parseFloat(priceVsEth) * ethPriceInUsd;
    }

    return pricesInUsd;
}