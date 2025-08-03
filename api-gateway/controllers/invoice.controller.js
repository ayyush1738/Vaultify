import * as ipfsService from '../services/ipfs.service.js';
import * as blockchainService from '../services/blockchain.service.js';
import * as ocrService from '../services/ocr.service.js'; // Assuming you use this
import { query } from '../config/db.js';

export const mintInvoice = async (req, res) => {
  try {
    const { smeAddress, chainId, invoiceAmount, dueDate, customerName, preferredTokenSymbol } = req.body;

    if (!req.file || !smeAddress || !chainId || !invoiceAmount || !dueDate || !customerName || !preferredTokenSymbol) {
      return res.status(400).json({ message: "Missing required fields for minting." });
    }

    // 1. Upload to IPFS
    const { metadataIpfsHash } = await ipfsService.uploadToIPFS(req.file, {
      invoiceAmount,
      dueDate,
      customerName,
      preferredTokenSymbol, // Pass this to include in metadata
    });

    // 2. Mint on Blockchain
    console.log('minting started');
    const mintResult = await blockchainService.mintInvoiceOnChain({
      smeAddress,
      invoiceAmount,
      dueDate,
      tokenURI: metadataIpfsHash,
      preferredTokenSymbol,
    });
    console.log('minting finished');

    // Destructure all the necessary data returned from the service
    const {
      nftId,
      txHash,
      fundingAmount, // <-- You need this value!
    } = mintResult;

    // A final check to prevent database errors
    if (!nftId || !fundingAmount) {
        throw new Error("Failed to get critical data (nftId, fundingAmount) from blockchain service.");
    }

    // 3. Save to DB with the CORRECT funding_amount
    await query(
      `INSERT INTO enterpriseInv 
        (sme_address, customer_name, ipfs_cid, invoice_amount, funded_amount, preferred_token_symbol, nft_id, tx_hash, status, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9)`,
      [
        smeAddress,
        customerName,
        metadataIpfsHash.replace('ipfs://', ''),
        parseFloat(invoiceAmount),
        parseFloat(fundingAmount), 
        preferredTokenSymbol,
        nftId,
        txHash,
        new Date(dueDate),
      ]
    );

    res.status(201).json({
      message: "Invoice minted successfully.",
      nftId,
      txHash,
      ipfsCID: metadataIpfsHash,
    });
  } catch (error) {
    console.error("Minting process failed:", error);
    res.status(500).json({ message: error.message || "An unexpected error occurred." });
  }
};

// The parseInvoice function remains the same
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