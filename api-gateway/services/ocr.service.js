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
    formData.append('document', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
    });

    try {
        console.log(`Sending file to OCR service at ${ocrApiUrl}...`);

        const response = await axios.post(ocrApiUrl, formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${ocrApiKey}`,
            },
            maxBodyLength: Infinity,
        });

        const rawData = response.data;

        // Example of expected structure, adapt this to your actual OCR provider response
        const lineItems = rawData.items || [];

        const totalCost = lineItems.reduce((acc, item) => {
            const quantity = parseFloat(item.quantity || 0);
            const unitPrice = parseFloat(item.unit_price || 0);
            return acc + (quantity * unitPrice);
        }, 0);

        const standardizedData = {
            invoiceNumber: rawData.invoice_id || null,
            amount: rawData.total_amount || totalCost,
            dueDate: rawData.due_date || null,
            issueDate: rawData.issue_date || null,
            customerName: rawData.customer_name || 'N/A',
            customerAddress: rawData.customer_address || '',
            lineItems: lineItems,
            tax: rawData.tax || 0,
            currency: rawData.currency || 'USD',
            notes: rawData.notes || '',
            totalCost,
        };

        return standardizedData;

    } catch (error) {
        console.error("❌ OCR API Error:", error.response ? error.response.data : error.message);
        throw new Error("Failed to parse the invoice document.");
    }
}
