// services/ocr.service.js
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Sends a file to the OCR API to extract invoice data.
 * @param {Express.Multer.File} file - Multer file from memoryStorage (buffer present)
 * @returns {Promise<object>}
 */
export async function parseInvoiceWithOCR(file) {
  const ocrApiUrl = process.env.OCR_API_URL;
  if (!ocrApiUrl) {
    throw new Error("OCR Service is not configured in the .env file (OCR_API_URL).");
  }

  const fileB64 = file.buffer.toString('base64');
  const payload = { file_b64: fileB64 };

  try {
    console.log(`📤 Sending file to OCR service at ${ocrApiUrl}...`);
    const { data: rawData } = await axios.post(ocrApiUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
      maxBodyLength: Infinity,
    });

    const lineItems = rawData.items || [];

    const totalCost = lineItems.reduce((acc, item) => {
      const quantity = parseFloat(item.quantity || 0);
      const unitPrice = parseFloat(item.unit_price || 0);
      return acc + (quantity * unitPrice);
    }, 0);

    // Normalized invoice object
    const standardizedData = {
      invoiceNumber: rawData.invoice_id || null,
      amount: rawData.total_amount ?? totalCost,
      dueDate: rawData.due_date || null,
      issueDate: rawData.issue_date || null,
      customerName: rawData.customer_name || 'Unknown Customer',
      customerAddress: rawData.customer_address || '',
      tax: rawData.tax || 0,
      currency: rawData.currency || 'USD',
      notes: rawData.notes || '',
      totalCost,
      lineItems,
      text: rawData.text || '',
      cid: rawData.cid || null,
      // Add this for downstream compatibility
      preferredTokenSymbol: 'USDC', // ⬅️ default (you can override on frontend later)
    };

    return standardizedData;
  } catch (error) {
    console.error("❌ OCR API Error:", error?.response?.data || error?.message);
    throw new Error("Failed to parse the invoice document.");
  }
}
