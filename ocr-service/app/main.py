from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel
import pytesseract
from pdf2image import convert_from_bytes
import base64
import logging
import traceback
import requests
import tempfile
import os
import re
import json 

logging.basicConfig(level=logging.INFO)
app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or set to your frontend URL like ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class OCRRequest(BaseModel):
    file_b64: str

TOTAL_KEYWORDS = [
    "total due", "total amount", "net amount", "amount payable",
    "invoice total", "total sum", "balance due", "total to pay",
    "grand total", "amount to pay", "net total"
]

def extract_likely_total(text: str) -> str:
    candidates = []

    for line in text.splitlines():
        lower_line = line.lower()
        # Look for "total" variants manually
        if "total" in lower_line or any(k in lower_line for k in TOTAL_KEYWORDS):
            print(f"🔍 Matched line: {line}")
            # Try to match INR, Rs., ₹, or plain float
            matches = re.findall(r"(?:rs\.?|inr|₹|$)?\s*([\d,]+\.\d{2})", lower_line)
            for amt in matches:
                try:
                    candidates.append(float(amt.replace(",", "")))
                except:
                    continue

    if not candidates:
        # Fallback: try getting the largest float-like value in entire doc
        matches = re.findall(r"([\d,]+\.\d{2})", text)
        for amt in matches:
            try:
                candidates.append(float(amt.replace(",", "")))
            except:
                continue

    if candidates:
        max_val = max(candidates)
        print(f"✅ Candidates: {candidates}, Max: {max_val}")
        return f"{max_val:.2f}"

    return "Not Found"



@app.post("/analyze")
async def analyze(req: OCRRequest):
    try:
        content = base64.b64decode(req.file_b64)
        images = convert_from_bytes(content)
        if not images:
            raise ValueError("No pages found in the PDF.")
            
        text = "".join([pytesseract.image_to_string(img) for img in images])
        total_amount = extract_likely_total(text)

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
            temp_pdf.write(content)
            temp_pdf_path = temp_pdf.name

        PINATA_API_KEY = os.getenv("PINATA_API_KEY")
        PINATA_API_SECRET = os.getenv("PINATA_API_SECRET")

        # === STEP 1: UPLOAD THE PDF (No changes here) ===
        pdf_cid = ""
        with open(temp_pdf_path, 'rb') as f:
            files = {'file': (os.path.basename(temp_pdf_path), f)}
            headers = {'pinata_api_key': PINATA_API_KEY, 'pinata_secret_api_key': PINATA_API_SECRET}
            response = requests.post('https://api.pinata.cloud/pinning/pinFileToIPFS', files=files, headers=headers)
            response.raise_for_status()
            pdf_cid = response.json()['IpfsHash']
            print(f"✅ Uploaded PDF to IPFS with CID: {pdf_cid}")

        os.remove(temp_pdf_path)

        # === STEP 2: CREATE AND UPLOAD THE JSON METADATA (New Block) ===
        print("✅ Creating JSON metadata...")
        metadata = {
            "name": f"Invoice (Amount: {total_amount})",
            "description": "A tokenized invoice managed by Vaultify. This NFT represents a claim on future cash flows.",
            # The 'image' field is what OpenSea and others use to display the content.
            # We point it to the PDF we just uploaded.
            "image": f"ipfs://{pdf_cid}", 
            "attributes": [
                {
                    "trait_type": "Invoice Amount",
                    "value": total_amount
                },
                {
                    "trait_type": "Status",
                    "value": "Pending Funding"
                }
                # You can add more attributes here later (e.g., due date, customer)
            ]
        }
        
        # Pin the JSON metadata to Pinata
        json_headers = {
            'pinata_api_key': PINATA_API_KEY,
            'pinata_secret_api_key': PINATA_API_SECRET,
            'Content-Type': 'application/json'
        }
        response = requests.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', data=json.dumps(metadata), headers=json_headers)
        response.raise_for_status()
        metadata_cid = response.json()['IpfsHash']
        print(f"✅ Uploaded JSON Metadata to IPFS with CID: {metadata_cid}")


        # === STEP 3: RETURN THE METADATA CID ===
        # The Vaultify backend only needs the final metadata CID.
        return {
            "total_amount": total_amount,
            "cid": metadata_cid # <-- Return the METADATA's CID, not the PDF's
        }

    except Exception as e:
        logging.error(f"OCR failed: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"OCR error: {str(e)}")