import { ethers, Interface } from 'ethers';
import vaultManagerAbi from '../config/vaultManager.js';
import getSupportedTokens from './token.service.js';

let provider;
let signer;
let vaultManagerContract;

export function initBlockchain() {
    const rpcUrl = process.env.RPC_URL;
    const privateKey = process.env.PRIVATE_KEY;
    const contractAddress = process.env.VAULT_MANAGER_ADDRESS;

    if (!rpcUrl || !privateKey || !contractAddress) {
        throw new Error("Missing blockchain environment variables in .env");
    }

    provider = new ethers.JsonRpcProvider(rpcUrl);
    signer = new ethers.Wallet(privateKey, provider);

    const iface = new Interface(vaultManagerAbi);
    vaultManagerContract = new ethers.Contract(contractAddress, vaultManagerAbi, signer);

    console.log("✅ Blockchain initialized. VaultManager address:", contractAddress);
}

export async function mintInvoiceOnChain(data) {
    const allTokens = getSupportedTokens; // ✅ Fix
    const tokenInfo = allTokens.find((t) => t.symbol === data.preferredTokenSymbol);

    if (!tokenInfo || !tokenInfo.address) {
        throw new Error(`❌ Unsupported token: ${data.preferredTokenSymbol}`);
    }

    const decimals = tokenInfo.decimals ?? 18;

    // Safe math for funding and repayment
    const baseAmountBI = ethers.parseUnits(data.invoiceAmount, decimals);
    const fundingAmountBI = baseAmountBI * 98n / 100n;
    const repaymentAmountBI = baseAmountBI;

    const metadataURI = data.tokenURI.startsWith('ipfs://')
        ? data.tokenURI
        : `ipfs://${data.tokenURI}`;

    try {
        const tx = await vaultManagerContract.mintInvoice(
            tokenInfo.address,
            fundingAmountBI,
            repaymentAmountBI,
            Math.floor(new Date(data.dueDate).getTime() / 1000),
            metadataURI
        );

        const receipt = await tx.wait();

        const topic = ethers.id("InvoiceMinted(uint256,address,string)");
        const log = receipt.logs.find((l) => l.topics[0] === topic);
        if (!log) throw new Error("InvoiceMinted event not found.");

        const parsedLog = vaultManagerContract.interface.parseLog(log);
        const nftId = parsedLog.args.nftId.toString();

        return {
            nftId,
            txHash: tx.hash,
            fundingAmount: ethers.formatUnits(fundingAmountBI, decimals),
            repaymentAmount: ethers.formatUnits(repaymentAmountBI, decimals),
            preferredToken: tokenInfo.symbol,
            tokenAddress: tokenInfo.address
        };
    } catch (err) {
        console.error("❌ mintInvoice failed:", err);
        throw new Error("Failed to mint invoice on-chain");
    }
}


export async function fundInvoiceOnChain({ investorAddress, nftId, amount, tokenSymbol }) {
  const allTokens = getSupportedTokens;
  const tokenInfo = allTokens.find(t => t.symbol === tokenSymbol);

  if (!tokenInfo || !tokenInfo.address) {
    throw new Error(`Unsupported token: ${tokenSymbol}`);
  }

  const decimals = tokenInfo.decimals || 18;
  const amountInWei = ethers.parseUnits(amount.toString(), decimals);

  const fundTx = await vaultManagerContract.fundInvoice(nftId, investorAddress, amountInWei);
  const receipt = await fundTx.wait();

  if (receipt.status !== 1) {
    throw new Error('Transaction failed');
  }

  return {
    txHash: fundTx.hash,
    status: 'success'
  };
}
