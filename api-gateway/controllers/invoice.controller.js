import * as ipfsService from '../services/ipfs.service.js';
import * as blockchainService from '../services/blockchain.service.js';
import * as dbService from '../services/db.service.js';
import * as ocrService from '../services/ocr.service.js';

export const mintInvoice = async (req, res) => {
    try {
        const { smeAddress, chainId, invoiceAmount, dueDate, customerName, preferredTokenSymbol } = req.body;
        if (!req.file || !smeAddress || !chainId || !invoiceAmount || !dueDate || !customerName || !preferredTokenSymbol) {
            return res.status(400).json({ message: "Missing required fields for minting." });
        }

        // 1. Upload to IPFS
        const { metadataIpfsHash } = await ipfsService.uploadToIPFS(req.file, { invoiceAmount, dueDate, customerName });

        // 2. Mint NFT on blockchain
        const { nftId, txHash } = await blockchainService.mintInvoiceOnChain({
            smeAddress,
            invoiceAmount,
            dueDate,
            tokenURI: metadataIpfsHash,
            preferredTokenSymbol
        });

        // 3. Construct invoice data
        const invoiceData = {
            sme_address: smeAddress,
            chain_id: parseInt(chainId),
            vault_contract_address: process.env.VAULT_MANAGER_ADDRESS,
            token_id: nftId,
            tx_hash: txHash,
            ipfs_cid: metadataIpfsHash,
            invoice_amount: parseFloat(invoiceAmount),
            funding_goal: parseFloat(invoiceAmount) * 0.98,
        };

        // 4. Save to DB
        const newInvoiceRecord = await dbService.createInvoice(invoiceData);

        res.status(201).json(newInvoiceRecord);
    } catch (error) {
        console.error("Minting process failed:", error);
        res.status(500).json({ message: error.message || "An unexpected error occurred." });
    }
};

export const parseInvoice = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded." });
    }

    try {
        const extractedData = await ocrService.parseInvoiceWithOCR(req.file);
        res.json(extractedData);
    } catch (error) {
        console.error("OCR parsing failed:", error);
        res.status(500).json({ message: error.message || "Could not parse document." });
    }
};
