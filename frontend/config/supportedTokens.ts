export const supportedTokens = [
  {
    address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    symbol: "USDC",
    decimals: 6,
    name: "USD Coin",
    logoURI: "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
    eip2612: true,
    tags: [
      "crosschain",
      "defi",
      "GROUP:USDC",
      "PEG:USD",
      "RISK:unverified",
      "stablecoin",
      "tokens"
    ],
  },
  {
    address: "0x6b175474e89094c44da98b954eedeac495271d0f",
    symbol: "DAI",
    decimals: 18,
    name: "Dai Stablecoin",
    logoURI: "https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png",
    eip2612: true,
    tags: [
      "crosschain",
      "defi",
      "GROUP:DAI",
      "PEG:USD",
      "RISK:unverified",
      "stablecoin",
      "synthetic",
      "tokens"
    ],
  },
  {
    address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    symbol: "ETH",
    decimals: 18,
    name: "Ether",
    logoURI: "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
    eip2612: false,
    tags: [
      "crosschain",
      "GROUP:ETH",
      "native",
      "PEG:ETH",
      "RISK:availability"
    ],
  }
];
