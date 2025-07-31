import { ethers, Interface } from 'ethers';
import vaultManagerAbi from '../config/vaultManager.js';
import { getSupportedTokens } from './token.service.js';

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

    // ✅ Correct Interface instantiation in Ethers v6
    const iface = new Interface(vaultManagerAbi);
    vaultManagerContract = new ethers.Contract(contractAddress, vaultManagerAbi, signer);

    console.log("✅ Blockchain initialized. VaultManager address:", contractAddress);
}

export async function mintInvoiceOnChain(data) {
    const allTokens = await getSupportedTokens();

    const tokenInfo = allTokens.find(
        (t) => t.symbol === data.preferredTokenSymbol
    );

    if (!tokenInfo || !tokenInfo.address) {
        throw new Error(`❌ Unsupported token: ${data.preferredTokenSymbol}`);
    }

    const fundingAmount = parseFloat(data.invoiceAmount) * 0.98;
    const repaymentAmount = parseFloat(data.invoiceAmount);

    const fundingAmountBI = ethers.parseUnits(
        fundingAmount.toFixed(tokenInfo.decimals),
        tokenInfo.decimals
    );
    const repaymentAmountBI = ethers.parseUnits(
        repaymentAmount.toFixed(tokenInfo.decimals),
        tokenInfo.decimals
    );

    const tx = await vaultManagerContract.mintInvoice(
        tokenInfo.address,
        fundingAmountBI,
        repaymentAmountBI,
        Math.floor(new Date(data.dueDate).getTime() / 1000),
        `ipfs://${data.tokenURI}`
    );

    const receipt = await tx.wait();

    // ✅ Use ethers.id to generate event topic hash in Ethers v6
    const topic = ethers.id("InvoiceMinted(address,uint256,uint256,uint256,string,uint256)");

    const log = receipt.logs.find((l) => l.topics[0] === topic);
    if (!log) {
        throw new Error("❌ InvoiceMinted event not found in transaction logs.");
    }

    const parsedLog = vaultManagerContract.interface.parseLog(log);
    const nftId = parsedLog.args.nftId.toString();

    return {
        nftId,
        txHash: tx.hash
    };
}
