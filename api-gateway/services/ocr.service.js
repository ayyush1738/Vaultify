import axios from 'axios';
import FormData from 'form-data';

/**
 * Sends a file to an external OCR API to extract invoice data.
 * @param {Express.Multer.File} file - The file object from multer.
 * @returns {Promise<object>} A promise that resolves to the structured JSON data from the OCR service.
 */
export async function parseInvoiceWithOCR(file) {
    const ocrApiUrl = process.env.OCR_API_URL;
    const ocrApiKey = process.env.OCR_API_KEY;

    if (!ocrApiUrl || !ocrApiKey) {
        throw new Error("OCR Service is not configured in the .env file.");
    }

    const formData = new FormData();
    // The field name 'document' or 'file' depends on your OCR API's documentation.
    formData.append('document', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
    });

    try {
        console.log(`Sending file to OCR service at ${ocrApiUrl}...`);
        
        const response = await axios.post(ocrApiUrl, formData, {
            headers: {
                ...formData.getHeaders(), // Important for multipart/form-data
                'Authorization': `Bearer ${ocrApiKey}`, // Or 'X-API-KEY', etc. - check your API docs
            },
            // The OCR service might return a lot of data
            maxBodyLength: Infinity, 
        });

        console.log("✅ Successfully received data from OCR service.");

        // --- IMPORTANT ---
        // The structure of response.data depends entirely on your OCR provider.
        // You MUST adapt the return object to match what your API sends back.
        // Here is an example of mapping the response to a standardized format for your app.
        
        const rawData = response.data; // e.g., { "invoice_id": "INV-123", "total_amount": 5000, "due_date": "2025-10-15", ... }

        const standardizedData = {
            invoiceNumber: rawData.invoice_id || null,
            amount: rawData.total_amount || 0,
            dueDate: rawData.due_date || null,
            customerName: rawData.customer_name || 'N/A',
            // Add any other fields you need
        };

        return standardizedData;

    } catch (error) {
        console.error("❌ OCR API Error:", error.response ? error.response.data : error.message);
        throw new Error("Failed to parse the invoice document. Please try a different file or contact support.");
    }
}