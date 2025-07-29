import { ethers } from 'ethers';
import vaultManagerAbi from '../config/vaultManager.js';
import { TOKENS } from '../config/supportedTokens.js';

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

    vaultManagerContract = new ethers.Contract(contractAddress, vaultManagerAbi, signer);

    console.log("🔗 Blockchain initialized. VaultManager address:", contractAddress);
}

export async function mintInvoiceOnChain(data) {
    const tokenInfo = TOKENS[data.preferredTokenSymbol];
    if (!tokenInfo) throw new Error(`Unsupported token: ${data.preferredTokenSymbol}`);

    const fundingAmount = parseFloat(data.invoiceAmount) * 0.98;
    const repaymentAmount = parseFloat(data.invoiceAmount);

    const tx = await vaultManagerContract.mintInvoice(
        data.smeAddress,
        tokenInfo.address,
        ethers.parseUnits(fundingAmount.toFixed(tokenInfo.decimals), tokenInfo.decimals),
        ethers.parseUnits(repaymentAmount.toFixed(tokenInfo.decimals), tokenInfo.decimals),
        Math.floor(new Date(data.dueDate).getTime() / 1000),
        `ipfs://${data.tokenURI}`
    );

    const receipt = await tx.wait();

    const event = receipt.events?.find((e) => e.event === 'InvoiceMinted');
    if (!event || !event.args) {
        throw new Error("Minting transaction failed or event not found.");
    }

    const nftId = event.args.nftId.toNumber();

    return {
        nftId,
        txHash: tx.hash
    };
}
