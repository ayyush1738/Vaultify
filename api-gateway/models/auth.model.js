// auth.model.js
import { query } from '../config/db.js';

export const findUserByWallet = async (wallet_address, callback) => {
    try {
        const result = await query("SELECT * FROM users WHERE wallet_address = $1", [wallet_address]);
        const user = result.rows[0];
        if (!user) return callback("User not found", null);
        return callback(null, user);
    } catch (err) {
        return callback(err.message, null);
    }
};

// Optional: allow profile update (username/email/role)
export const updateUserProfile = async (wallet_address, username, email, role, callback) => {
    try {
        const allowedRoles = ['investor', 'enterprise'];
        if (!allowedRoles.includes(role)) return callback("Invalid role", null);

        await query(
            "UPDATE users SET username = $1, email = $2, role = $3 WHERE wallet_address = $4",
            [username, email, role, wallet_address]
        );
        return callback(null, "Profile updated successfully");
    } catch (err) {
        return callback(err.message, null);
    }
};
