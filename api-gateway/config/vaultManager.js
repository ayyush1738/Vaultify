const vaultManagerAbi = [
  {
    "inputs": [
      { "internalType": "address", "name": "_sme", "type": "address" },
      { "internalType": "address", "name": "_token", "type": "address" },
      { "internalType": "uint256", "name": "_fundingAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "_repaymentAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "_dueDate", "type": "uint256" },
      { "internalType": "string", "name": "_tokenURI", "type": "string" }
    ],
    "name": "mintInvoice",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "nftId", "type": "uint256" },
      { "indexed": false, "internalType": "address", "name": "sme", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "fundingAmount", "type": "uint256" }
    ],
    "name": "InvoiceMinted",
    "type": "event"
  }
];

export default vaultManagerAbi;
