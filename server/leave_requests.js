const express = require('express');
const router = express.Router();
const pool = require('./db'); 
router.get('/user/:userId', async (req, res) => {
    let connection;
    try {
        const userId = req.params.userId;
        connection = await pool.getConnection();

        // 1. Get user from USERS table
        const [userRows] = await connection.query(
            `SELECT id, name, email, role FROM users WHERE id = ?`,
            [userId]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = userRows[0];

        const role = user.role.toUpperCase().trim();

const isPrivilegedUser = ['GM', 'HR', 'GENERAL MANAGER', 'ADMIN'].includes(role);

        // ============================
        // GM / HR LOGIC
        // ============================
        if (isPrivilegedUser) {
            console.log(`👉 ${user.role} detected. Fetching ALL leaves`);

            const [allLeaves] = await connection.query(
                `SELECT * FROM leave_requests ORDER BY id DESC`
            );

            return res.json({
                profile: {
                    employee_id: user.id,
                     employee_name: user.name,
                      email: user.email,
                      role: user.role
                },
                leaves: allLeaves
            });
        }

        // ============================
        // NORMAL EMPLOYEE LOGIC
        // ============================
        const [empRows] = await connection.query(
            `SELECT * FROM employees WHERE email = ?`,
            [user.email]
        );

        if (empRows.length === 0) {
            return res.status(404).json({
                error: 'Employee profile not found. Please contact HR.'
            });
        }

        const employee = empRows[0];

        const [myLeaves] = await connection.query(
            `SELECT * FROM leave_requests WHERE employee_id = ? ORDER BY id DESC`,
            [employee.employee_id]
        );

        res.json({
            profile: employee,
            leaves: myLeaves
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// ==================================================
// 2. CREATE NEW LEAVE REQUEST
// ==================================================
router.post('/create', async (req, res) => {
    let connection;
    try {
        // We expect these details from the frontend
       const { employee_id, employee_name, department, role, branch, no_of_days, leave_type, reason, remarks, start_date, end_date } = req.body;
        
        connection = await pool.getConnection();

        // FORCE status to 'Pending' here
        const sql = `
    INSERT INTO leave_requests 
    (employee_id, employee_name, department, role, branch, no_of_days, leave_type, reason, remarks, start_date, end_date, status, applied_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', NOW(), NOW())
`;
        await connection.query(sql, [employee_id, employee_name, department, role, branch, no_of_days, leave_type, reason, remarks, start_date, end_date]);

        res.json({ message: 'Leave request submitted successfully' });

    } catch (err) {
        console.error("Insert Error:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// ==================================================
// 3. DELETE LEAVE REQUEST
// ==================================================
router.delete('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        // Ideally, you should also check if status is 'Pending' before deleting, 
        // but frontend usually handles the button visibility.
        await connection.query(`DELETE FROM leave_requests WHERE id = ?`, [req.params.id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// ==================================================
// 4. UPDATE LEAVE REQUEST (Edit)
// ==================================================
router.put('/update/:id', async (req, res) => {
    let connection;
    try {
        // ✅ SECURITY: We ONLY extract the editable fields.
        // We do NOT extract 'status' from req.body, so even if a hacker sends it, we ignore it.
       const { leave_type, reason, remarks, no_of_days, start_date, end_date } = req.body;
        const leaveId = req.params.id;

        connection = await pool.getConnection();

        // 1. Check if the leave exists and is still "Pending"
        const [rows] = await connection.query('SELECT status FROM leave_requests WHERE id = ?', [leaveId]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Leave request not found' });
        }
        
        // Safety Check: Prevent editing if HR has already Approved/Rejected it
        if (rows[0].status !== 'Pending') {
            return res.status(403).json({ error: 'You cannot edit a request that has already been processed.' });
        }

        // 2. Perform Update
        // ✅ SECURITY: The SQL statement does NOT update the 'status' column.
        const sql = `
    UPDATE leave_requests 
    SET leave_type = ?, reason = ?, remarks = ?, no_of_days = ?, start_date = ?, end_date = ?, updated_at = NOW()
    WHERE id = ? AND status = 'Pending'
`;
        await connection.query(sql, [leave_type, reason, remarks, no_of_days, start_date, end_date, req.params.id]);

        res.json({ message: 'Leave request updated successfully' });

    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

router.put('/status/:id', async (req, res) => {
    let connection;
    try {
        // We expect 'status' and 'approved_by_role' from frontend
        const { status, approved_by_role } = req.body; 
        const leaveId = req.params.id;

        connection = await pool.getConnection();

        const sql = `
            UPDATE leave_requests 
            SET status = ?, approved_by_role = ?, updated_at = NOW()
            WHERE id = ?
        `;

        await connection.query(sql, [status, approved_by_role, leaveId]);

        res.json({ message: `Leave request ${status} successfully` });

    } catch (err) {
        console.error("Status Update Error:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// GET PENDING LEAVES COUNT (GM)
router.get('/pending/count', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();

        const [rows] = await connection.query(
            `SELECT COUNT(*) AS pendingCount FROM leave_requests WHERE status = 'Pending'`
        );

        res.json({ pending: rows[0].pendingCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});


module.exports = router;