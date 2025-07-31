import axios from 'axios';
import FormData from 'form-data';
import dotenv from 'dotenv';

dotenv.config()

export async function uploadToIPFS(file, metadata) {
    const pinataApiKey = process.env.PINATA_API_KEY;
    const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;
    const pinataJWT = process.env.PINATA_JWT;

    if (!pinataApiKey || !pinataSecretApiKey || !pinataJWT) {
        throw new Error("Pinata credentials (API Key, Secret, JWT) are not fully configured in .env.");
    }

    try {
        // 1. Upload the file to IPFS
        const fileFormData = new FormData();
        fileFormData.append('file', file.buffer, { filename: file.originalname });

        const fileRes = await axios.post(
            'https://api.pinata.cloud/pinning/pinFileToIPFS',
            fileFormData,
            {
                maxBodyLength: Infinity,
                headers: {
                    ...fileFormData.getHeaders(),
                    pinata_api_key: pinataApiKey,
                    pinata_secret_api_key: pinataSecretApiKey,
                    Authorization: `Bearer ${pinataJWT}`
                }
            }
        );

        const fileIpfsHash = fileRes.data.IpfsHash;

        // 2. Create and upload metadata JSON
        const jsonMetadata = {
            name: `Invoice from ${metadata.customerName}`,
            description: `Invoice for ${metadata.invoiceAmount} USD due on ${metadata.dueDate}`,
            image: `https://gateway.pinata.cloud/ipfs/${fileIpfsHash}`,
            attributes: [
                { trait_type: 'Amount (USD)', value: metadata.invoiceAmount },
                { trait_type: 'Customer', value: metadata.customerName },
                {
                    trait_type: 'Due Date',
                    value: Math.floor(new Date(metadata.dueDate).getTime() / 1000)
                }
            ]
        };

        const jsonRes = await axios.post(
            'https://api.pinata.cloud/pinning/pinJSONToIPFS',
            jsonMetadata,
            {
                headers: {
                    'Content-Type': 'application/json',
                    pinata_api_key: pinataApiKey,
                    pinata_secret_api_key: pinataSecretApiKey,
                    Authorization: `Bearer ${pinataJWT}`
                }
            }
        );

        const metadataIpfsHash = jsonRes.data.IpfsHash;

        return {
            metadataIpfsHash,
            fileIpfsHash,
            fileGatewayUrl: `https://gateway.pinata.cloud/ipfs/${fileIpfsHash}`,
            metadataGatewayUrl: `https://gateway.pinata.cloud/ipfs/${metadataIpfsHash}`
        };
    } catch (error) {
        console.error('IPFS Upload Error:', error?.response?.data || error.message);
        throw new Error('Failed to upload file or metadata to IPFS.');
    }
}
