const express = require('express');
const router = express.Router();
const pool = require('./db');

// ==========================================
// 1. GET Timesheet Summary List (Fixes 404 Error)
// ==========================================
router.get('/api/timesheet', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        
        // This query groups the weekly entries to show a summary for the bottom table
        // Adjust the SQL if you have a separate summary table
        const sql = `
            SELECT 
                t.employee_id,
                e.employee_name,
                t.week_start_date as date,
                COUNT(t.id) as tasks_completed,
                '40 Hrs' as hours_worked, -- Placeholder or calculation
                'Manager' as approved_by,
                'Pending' as status
            FROM hr_weekly_schedule t
            LEFT JOIN Employees e ON t.employee_id = e.employee_id
            GROUP BY t.employee_id, t.week_start_date
            ORDER BY t.week_start_date DESC
        `;

        const [rows] = await connection.query(sql);
        res.json(rows);
    } catch (err) {
        console.error("Error fetching timesheet list:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// ==========================================
// 2. GET Timesheet Grid Data
// ==========================================
router.get('/api/timesheet/grid', async (req, res) => {
    let connection;
    try {
        const { employee_id, week_start_date } = req.query;

        if (!employee_id || !week_start_date) {
            return res.status(400).json({ error: "Employee ID and Week Start Date required" });
        }

        connection = await pool.getConnection();
        
        const sql = `
            SELECT day_name, time_slot, task_description 
            FROM hr_weekly_schedule 
            WHERE employee_id = ? AND week_start_date = ?
        `;
        
        const [rows] = await connection.query(sql, [employee_id, week_start_date]);
        res.json(rows);
    } catch (err) {
        console.error("Error fetching grid:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// ==========================================
// 3. SAVE (Upsert) Timesheet Grid Data
// ==========================================
router.post('/api/timesheet/save-grid', async (req, res) => {
    let connection;
    try {
        const { employee_id, week_start_date, entries } = req.body;

        if (!employee_id || !week_start_date || !entries) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        connection = await pool.getConnection();
        await connection.beginTransaction();

        const sql = `
            INSERT INTO hr_weekly_schedule 
            (employee_id, week_start_date, day_name, time_slot, task_description)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE task_description = VALUES(task_description)
        `;

        for (const entry of entries) {
            if (entry.task && entry.task.trim() !== "") {
                await connection.query(sql, [
                    employee_id, 
                    week_start_date, 
                    entry.day, 
                    entry.slot, 
                    entry.task
                ]);
            }
        }

        await connection.commit();
        res.json({ message: "Timesheet saved successfully!" });

    } catch (err) {
        if (connection) await connection.rollback();
        console.error("Error saving grid:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;