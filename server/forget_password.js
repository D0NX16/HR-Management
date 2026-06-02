// const express = require('express');
// const crypto = require('crypto');
// const bcrypt = require('bcrypt');
// const nodemailer = require('nodemailer');
// const router = express.Router();
// const db = require('./db'); // Ensure this path is correct for your database connection

// // 1. Forgot Password Route
// router.post('/', async (req, res) => {
//     const { email } = req.body;

//     // Check if user exists
//     db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
//         if (err) return res.status(500).json({ error: 'Database error' });
//         if (results.length === 0) {
//             // For security, always return success even if email isn't found
//             return res.status(200).json({ message: 'If email exists, link sent.' });
//         }

//         // Generate a random token
//         const resetToken = crypto.randomBytes(32).toString('hex');
//         // Set expiry for 1 hour from now
//         const tokenExpiry = new Date(Date.now() + 3600000); 

//         // Save token to DB
//         db.query('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?',
//         [resetToken, tokenExpiry, email], async (updateErr) => {
//             if (updateErr) return res.status(500).json({ error: 'Database error' });

//             // Create Reset Link (Make sure this matches your Live Server port, e.g., 5500)
//             const resetLink = `http://localhost:3000/Html/reset-password.html?token=${resetToken}`;

//             // Send Email using Nodemailer
//             let transporter = nodemailer.createTransport({
//                 service: 'gmail',
//                 auth: {
//                     user: 'dhanukumar1618@gmail.com',
//                     pass: 'dbrq waaa hgvd ricb' // <--- PUT YOUR GOOGLE APP PASSWORD HERE
//                 }
//             });

//             try {
//                 await transporter.sendMail({
//                     from: 'dhanukumar1618@gmail.com',
//                     to: email,
//                     subject: 'Password Reset Request - Kalsun Groups',
//                     html: `
//                         <h3>Password Reset Request</h3>
//                         <p>You requested a password reset. Click the link below to set a new password:</p>
//                         <a href="${resetLink}" style="padding: 10px 20px; background-color: #3d78e3; color: white; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Reset Password</a>
//                         <p style="margin-top: 20px; color: gray; font-size: 12px;">This link expires in 1 hour.</p>
//                     `
//                 });
//                 res.status(200).json({ message: 'Reset email sent!' });
//             } catch (emailErr) {
//                 console.error("Nodemailer Error:", emailErr);
//                 res.status(500).json({ error: 'Failed to send email' });
//             }
//         });
//     });
// });

// // 2. Reset Password Route (For when they click the link in the email)
// router.post('/reset-password', async (req, res) => {
//     const { token, newPassword } = req.body;

//     // Find user with this token where the expiry is still in the future
//     db.query('SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()', [token], async (err, results) => {
//         if (err) return res.status(500).json({ error: 'Database error' });
        
//         if (results.length === 0) {
//             return res.status(400).json({ error: 'Token is invalid or has expired' });
//         }

//         const userId = results[0].id;

//         // Hash the new password
//         const hashedPassword = await bcrypt.hash(newPassword, 10);

//         // Update the user's password and clear the token
//         db.query('UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?', 
//         [hashedPassword, userId], (updateErr) => {
//             if (updateErr) return res.status(500).json({ error: 'Failed to update password' });

//             res.status(200).json({ message: 'Password successfully updated' });
//         });
//     });
// });

// module.exports = router;
const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const router = express.Router();
const db = require('./db'); // This is a mysql2/promise pool

// 1. Forgot Password Route
router.post('/', async (req, res) => {
    const { email } = req.body;
    console.log("--> Password reset requested for:", email);

    try {
        const [results] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        // 👇 CHANGED HERE: Now it will tell you if the email is not found
        if (results.length === 0) {
            return res.status(404).json({ error: 'User with this email not found.' });
        }

        // Generate a random token
        const resetToken = crypto.randomBytes(32).toString('hex');

        await db.query(`UPDATE users SET reset_token = ?, reset_token_expiry = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE email = ?`, [resetToken, email]);

        const resetLink = `http://127.0.0.1:5500/Html/reset-password.html?token=${resetToken}`;

        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, 
            auth: {
                user: 'dhanukumar1618@gmail.com',
                pass: process.env.EMAIL_PASS 
            },
            connectionTimeout: 10000, 
            greetingTimeout: 10000,
            socketTimeout: 10000
        });

        console.log("--> Attempting to send email...");
        await transporter.sendMail({
            from: 'dhanukumar1618@gmail.com',
            to: email,
            subject: 'Password Reset Request - Kalsun Groups',
            html:  `
    <div style="margin:0; padding:0; background-color:#f4f6f9; font-family: Arial, sans-serif;">
        
        <table align="center" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
            <tr>
                <td align="center">
                    
                    <table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:10px; padding:30px; box-shadow:0 5px 15px rgba(0,0,0,0.08);">
                        
                        <!-- Header -->
                        <tr>
                            <td align="center" style="padding-bottom:20px;">
                                <h2 style="margin:0; color:#2c3e50;">Kalsun Groups</h2>
                            </td>
                        </tr>

                        <!-- Divider -->
                        <tr>
                            <td style="border-bottom:1px solid #e0e0e0; padding-bottom:20px;"></td>
                        </tr>

                        <!-- Body -->
                        <tr>
                            <td style="padding-top:20px; color:#555; font-size:15px; line-height:1.6;">
                                
                                <p>Hi,</p>

                                <p>You recently requested to reset your password. Click the button below to proceed:</p>

                                <div style="text-align:center; margin:30px 0;">
                                    <a href="${resetLink}" 
                                       style="background-color:#3d78e3; 
                                              color:#ffffff; 
                                              padding:14px 28px; 
                                              text-decoration:none; 
                                              font-size:15px; 
                                              font-weight:bold; 
                                              border-radius:6px; 
                                              display:inline-block;">
                                        Reset Password
                                    </a>
                                </div>

                                <p>If you did not request this password reset, you can safely ignore this email.</p>

                                <p style="font-size:13px; color:#888;">
                                    ⏳ This link will expire in 1 hour for security reasons.
                                </p>

                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="border-top:1px solid #e0e0e0; padding-top:20px; text-align:center; font-size:12px; color:#999;">
                                © ${new Date().getFullYear()} Kalsun Groups. All rights reserved.
                            </td>
                        </tr>

                    </table>

                </td>
            </tr>
        </table>

    </div>
    `
        });
        
        console.log("✅ Email sent successfully!");
        res.status(200).json({ message: 'Reset email sent!' });

    } catch (err) {
        console.error("❌ Error:", err);
        res.status(500).json({ error: 'Server or Database error. Check terminal for details.' });
    }
});

// 2. Reset Password Route
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        // ✅ FIX: Use await and destructuring
        const [results] = await db.query('SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()', [token]);
        
        if (results.length === 0) {
            return res.status(400).json({ error: 'Token is invalid or has expired' });
        }

        const userId = results[0].id;
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // ✅ FIX: Use await for UPDATE query
        await db.query('UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?', [hashedPassword, userId]);

        res.status(200).json({ message: 'Password successfully updated' });

    } catch (err) {
        console.error("❌ Reset Error:", err);
        res.status(500).json({ error: 'Failed to update password due to a server error' });
    }
});

module.exports = router;