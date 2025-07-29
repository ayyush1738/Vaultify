// auth.controller.js
import crypto from 'crypto';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { findUserByWallet, updateUserProfile } from '../models/auth.model.js';
import db from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET;
const nonces = new Map();

const createLoginMessage = (nonce) => `Sign this message to login. Nonce: ${nonce}`;

export const enterpriseLogin = async (req, res) => {
    const { wallet_address, signature, nonce, username } = req.body;
    const storedNonce = nonces.get(wallet_address);

    if (!storedNonce || storedNonce !== nonce) {
        return res.status(400).json({ message: 'Invalid or expired nonce' });
    }

    try {
        const message = createLoginMessage(nonce);
        const recoveredAddress = ethers.verifyMessage(message, signature);

        if (recoveredAddress.toLowerCase() !== wallet_address.toLowerCase()) {
            return res.status(401).json({ message: 'Invalid signature' });
        }

        findUserByWallet(wallet_address, async (err, user) => {
            if (err && err !== 'User not found') return res.status(400).json({ message: err });

            if (!user) {
                if (!username) return res.status(400).json({ message: 'Organization name is required' });

                await db.query(
                    "INSERT INTO users (wallet_address, role, username) VALUES ($1, $2, $3)",
                    [wallet_address, 'enterprise', username]
                );
                user = { wallet_address, role: 'enterprise', username };
                console.log(`Auto-registered enterprise: ${username} (${wallet_address})`);
            } else {
                if (user.role !== 'enterprise') {
                    return res.status(403).json({ message: 'Access denied: Not an enterprise user' });
                }

                if (user.username !== username) {
                    return res.status(403).json({ message: 'Access denied: Wrong username' });
                }
            }

            const token = jwt.sign(
                { wallet_address, role: user.role },
                JWT_SECRET,
                { expiresIn: "6h" }
            );

            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "Strict",
                path: "/",
                maxAge: 6 * 60 * 60 * 1000,
            });

            nonces.delete(wallet_address);
            res.json({ message: "Login successful", token, role: user.role });
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Signature verification failed' });
    }
};

export const getNonce = (req, res) => {
    const { wallet_address } = req.query;
    if (!wallet_address) return res.status(400).json({ message: 'Missing wallet_address' });

    const nonce = crypto.randomBytes(16).toString('hex');
    nonces.set(wallet_address, nonce);
    res.json({ nonce, message: createLoginMessage(nonce) });
};
