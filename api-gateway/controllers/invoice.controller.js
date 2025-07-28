// controllers/invoiceController.js

import axios from 'axios';
import { ethers } from 'ethers';
import db from '../config/db.js';
import { broadcastTransaction } from '../services/oneInch.service.js';
import PinataClient from '@pinata/sdk';

// --- Initialize Pinata SDK ---
// It will automatically read credentials from your .env file
const pinata = new PinataClient({
    pinataApiKey: process.env.PINATA_API_KEY,
    pinataSecretApiKey: process.env.PINATA_API_SECRET,
});

// --- Smart Contract ABI ---
// This must match the `createVault` function in your VaultManager.sol
const VAULT_MANAGER_ABI = [
  "function createVault(address sme, uint256 fundingGoal, string ipfsCid, bytes zkProof)"
];

// --- Placeholder ZK-Proof Service ---
const zkpService = {
  generateNonMembershipProof: async (invoiceHash) => {
    console.log(`Mock ZKP: Generating proof for hash: ${invoiceHash}`);
    // In a real system, this would use Circom/Noir to prove the hash doesn't exist on-chain.
    return "0xdeadbeef"; // Dummy proof for now
  }
};


/**
 * Controller to handle the entire invoice vault minting process from file upload to transaction broadcast.
 */
export const mintInvoiceVault = async (req, res) => {
  const file = req.file;
  const { smeAddress, chainId, fundingGoal } = req.body;

  // --- 1. Validation ---
  if (!file) return res.status(400).json({ message: 'No invoice file uploaded.' });
  if (!smeAddress || !chainId || !fundingGoal) {
    return res.status(400).json({ message: 'Missing required fields: smeAddress, chainId, or fundingGoal.' });
  }

  try {
    // --- 2. OCR & PDF Upload (via external service) ---
    console.log("Step 1: Calling OCR service for data and PDF CID...");
    const fileB64 = file.buffer.toString('base64');
    const ocrResp = await axios.post('http://127.0.0.1:8002/analyze', { file_b64: fileB64 });

    const { cid: pdfCid, total_amount: invoiceAmount } = ocrResp.data;
    if (!pdfCid || invoiceAmount === 'Not Found' || !invoiceAmount) {
      return res.status(500).json({ message: 'Failed to get valid CID or amount from OCR service.' });
    }
    console.log(`Step 1 Complete: Received PDF CID: ${pdfCid} and Amount: ${invoiceAmount}`);


    // --- 3. Create NFT Metadata and Pin to IPFS (Handled by this backend) ---
    console.log("Step 2: Creating and pinning NFT JSON Metadata via Pinata...");
    const metadata = {
      name: `Invoice for ${invoiceAmount}`,
      description: "A tokenized invoice managed by Vaultify. This NFT represents a claim on future cash flows.",
      image: `ipfs://${pdfCid}`, // The `image` field points to the actual invoice PDF on IPFS
      attributes: [
        {
          "trait_type": "Invoice Amount",
          "value": parseFloat(invoiceAmount) // Ensure it's a number
        },
        {
          "trait_type": "Funding Status",
          "value": "Pending"
        }
      ]
    };
    const pinataResponse = await pinata.pinJSONToIPFS(metadata);
    const metadataCid = pinataResponse.IpfsHash; // This is the final CID for the NFT's tokenURI
    console.log(`Step 2 Complete: Pinned metadata with CID: ${metadataCid}`);


    // --- 4. Generate ZK-Proof of Uniqueness ---
    // The proof ensures this specific metadata (and thus this invoice) has not been minted before.
    console.log("Step 3: Generating ZK-Proof of Uniqueness...");
    const invoiceHash = ethers.solidityPackedKeccak256(["string"], [metadataCid]);
    const zkProof = await zkpService.generateNonMembershipProof(invoiceHash);
    console.log("Step 3 Complete: Generated mock ZK-Proof.");


    // --- 5. Build the EVM Transaction ---
    console.log("Step 4: Building the EVM transaction...");
    const contractInterface = new ethers.Interface(VAULT_MANAGER_ABI);
    const vaultManagerAddress = process.env.VAULT_MANAGER_CONTRACT_ADDRESS;
    const calldata = contractInterface.encodeFunctionData("createVault", [
      smeAddress,
      ethers.parseUnits(fundingGoal.toString(), 18), // Convert funding goal to wei
      metadataCid, // Pass the METADATA's CID to the contract
      zkProof
    ]);


    // --- 6. Broadcast via 1inch Service ---
    // This part remains a MOCK because it requires a signature from the frontend.
    // In a real application, the frontend would construct a similar transaction,
    // ask the user to sign it, and send the `signedRawTx` to this backend.
    console.log("Step 5: MOCKING transaction broadcast via 1inch Service...");
    const mockSignedRawTx = "0xYourSignedTransactionFromTheFrontend"; // Placeholder
    // const { transactionHash } = await broadcastTransaction(chainId, mockSignedRawTx); // The real call
    const transactionHash = `0xmock_${ethers.hexlify(ethers.randomBytes(30))}`; // A realistic mock hash
    console.log(`Step 5 Complete: Mock broadcast successful. Tx Hash: ${transactionHash}`);


    // --- 7. Save Final Record to Database ---
    console.log("Step 6: Saving final record to PostgreSQL...");
    const query = `
      INSERT INTO invoices (sme_address, chain_id, vault_contract_address, tx_hash, ipfs_cid, invoice_amount, funding_goal, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pending Funding')
      RETURNING *;
    `;
    const values = [
      smeAddress,
      chainId,
      vaultManagerAddress,
      transactionHash,
      metadataCid, // Store the final, correct metadata CID
      parseFloat(invoiceAmount),
      parseFloat(fundingGoal),
    ];
    const { rows } = await db.query(query, values);
    console.log("Step 6 Complete: Record saved.");


    // --- 8. Send Success Response to Frontend ---
    res.status(201).json({
      message: 'Invoice vault minting process initiated!',
      transactionHash: transactionHash,
      newInvoiceRecord: rows[0]
    });

  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message || 'An internal server error occurred.';
    console.error('❌ Minting Process Failed:', err.stack || err);
    res.status(500).json({ message: errorMessage });
  }
};