import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import authRouter from './routes/auth.routes.js';
import invoiceRouter from './routes/invoice.routes.js'

const app = express();
const PORT = process.env.PORT || 8001;

app.use(express.json());  
app.use(express.urlencoded({ extended: true }));  
app.use(cookieParser());
app.use(cors({
    origin: '*',  
    credentials: true,
}));

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/enterprise', invoiceRouter);

app.listen(8000, () => {
    console.log(`Server is running on port: ${PORT}`);
});