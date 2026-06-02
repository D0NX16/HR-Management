const express = require('express');
const router = express.Router();
const pool = require('./db'); // Assuming mysql2 pool

const getUser = (req) => ({
    id: parseInt(req.headers['x-user-id']),
    name: req.headers['x-user-name'],
    role: req.headers['x-user-role']
});

// GET ALL (And trigger "Seen" logic)
router.get('/api/comments', async (req, res) => {
    const user = getUser(req);

    // If a Manager/CEO/Admin opens the chat, mark others' messages as READ
    const adminRoles = ['CEO', 'VP', 'ADMIN', 'GENERAL MANAGER', 'GM'];
    if (user.role && adminRoles.includes(user.role.toUpperCase())) {
        await pool.query(
            "UPDATE platform_comments SET is_read = 1 WHERE author_id != ? AND is_read = 0",
            [user.id]
        );
    }

    const [rows] = await pool.query("SELECT * FROM platform_comments ORDER BY created_at ASC");
    res.json(rows);
});

// CREATE THREAD
router.post('/api/comments', async (req, res) => {
    const user = getUser(req);
    const { text } = req.body;
    const [r] = await pool.query(
        "INSERT INTO platform_comments(text, author_id, author_name, author_role, parent_id) VALUES(?,?,?,?,NULL)",
        [text, user.id, user.name, user.role]
    );
    res.json({ id: r.insertId });
});

// REPLY
router.post('/api/comments/:id/reply', async (req, res) => {
    const user = getUser(req);
    const { text } = req.body;
    const parentId = req.params.id;
    const [r] = await pool.query(
        "INSERT INTO platform_comments(text, author_id, author_name, author_role, parent_id) VALUES(?,?,?,?,?)",
        [text, user.id, user.name, user.role, parentId]
    );
    res.json({ id: r.insertId });
});

// EDIT (PUT) - This fixes your JSON Error!
router.put('/api/comments/:id', async (req, res) => {
    const { text } = req.body;
    const { id } = req.params;
    // Updates text and sets updated_at to current time
    await pool.query("UPDATE platform_comments SET text = ?, updated_at = NOW() WHERE id = ?", [text, id]);
    res.json({ success: true });
});

// DELETE
router.delete('/api/comments/:id', async (req, res) => {
    const { id } = req.params;
    // Delete replies first to prevent foreign key errors
    await pool.query("DELETE FROM platform_comments WHERE parent_id = ?", [id]);
    // Then delete the message
    await pool.query("DELETE FROM platform_comments WHERE id = ?", [id]);
    res.json({ success: true });
});

module.exports = router;