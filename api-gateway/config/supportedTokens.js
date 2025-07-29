// config/supportedTokens.js

export const TOKENS = {
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // Ethereum mainnet address
    decimals: 6,
    logoURI: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=032"
  },
  DAI: {
    symbol: "DAI",
    name: "Dai Stablecoin",
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", // Ethereum mainnet address
    decimals: 18,
    logoURI: "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png?v=032"
  },
  USDT: {
    symbol: "USDT",
    name: "Tether USD",
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // Ethereum mainnet address
    decimals: 6,
    logoURI: "https://cryptologos.cc/logos/tether-usdt-logo.png?v=032"
  },
  WETH: {
    symbol: "WETH",
    name: "Wrapped Ether",
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // Ethereum mainnet address
    decimals: 18,
    logoURI: "https://cryptologos.cc/logos/wrapped-ethereum-weth-logo.png?v=032"
  }
};
