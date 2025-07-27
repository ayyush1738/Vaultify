import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import healthcheckRouter from './app/routes/healthcheck.routes.js';
import authRouter from './app/routes/auth.routes.js';
// import invoiceRouter from './app/routes/invoice.routes.js';
// import investorRouter from './app/routes/investor.routes.js';
// import customerRouter from './app/routes/customer.routes.js';
// import enterpriseRouter from './app/routes/enterprise.routes.js'

const app = express();

app.use(express.json());  
app.use(express.urlencoded({ extended: true }));  
app.use(cookieParser());
app.use(cors({
    origin: '*',  
    credentials: true,
}));

// Routes
app.use('/api/v1/healthcheck', healthcheckRouter);
app.use('/api/v1/auth', authRouter);
// app.use('/api/v1/invoice', invoiceRouter);
// app.use('/api/v1/investor', investorRouter);
// app.use('/api/v1/customer', customerRouter);
// app.use('/api/v1/enterprise', enterpriseRouter);

app.listen(8000, () => {
    console.log('Server is running on port: 8000');
});