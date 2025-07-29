import multer from 'multer';

// Use memory storage to handle the file as a buffer before uploading to IPFS
const storage = multer.memoryStorage();
export const upload = multer({ storage: storage });