const express = require('express');
const router = express.Router();
const pool = require('./db'); 
const excel = require('exceljs'); // Import ExcelJS

// ✅ GET: Export Attendance Report to Excel (Date Range)
// URL: /api/attendance/export?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get('/export', async (req, res) => {
    let connection;
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ error: "Start Date and End Date are required" });
        }

        connection = await pool.getConnection();

        // Query to get attendance joined with employee details
        const sql = `
            SELECT 
                e.employee_id, 
                e.employee_name, 
                ee.department,
                ee.designation,
                DATE_FORMAT(a.attendance_date, '%Y-%m-%d') as date,
                a.status,
                TIME_FORMAT(a.clock_in, '%H:%i') as clock_in,
                TIME_FORMAT(a.clock_out, '%H:%i') as clock_out
            FROM Attendance a
            JOIN Employees e ON a.employee_id = e.employee_id
            LEFT JOIN Employee_Employment ee ON e.employee_id = ee.employee_id
            WHERE a.attendance_date BETWEEN ? AND ?
            ORDER BY a.attendance_date DESC, e.employee_name ASC
        `;

        const [rows] = await connection.query(sql, [startDate, endDate]);

        // Create Excel Workbook
        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Attendance Report');

        // Define Columns
        worksheet.columns = [
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Employee ID', key: 'employee_id', width: 15 },
            { header: 'Name', key: 'employee_name', width: 25 },
            { header: 'Department', key: 'department', width: 20 },
            { header: 'Designation', key: 'designation', width: 20 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Clock In', key: 'clock_in', width: 15 },
            { header: 'Clock Out', key: 'clock_out', width: 15 }
        ];

        // Style Header Row
        worksheet.getRow(1).font = { bold: true };
        
        // Add Data Rows
        worksheet.addRows(rows);

        // Set Response Headers for Download
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=" + `Attendance_Report_${startDate}_to_${endDate}.xlsx`
        );

        // Write to Response
        await workbook.xlsx.write(res);
        res.status(200).end();

    } catch (err) {
        console.error("Error exporting excel:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// ✅ GET: Fetch All Employees + Attendance for a specific Date
router.get('/', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const date = req.query.date || new Date().toISOString().split('T')[0];

        const sql = `
            SELECT 
                e.employee_id, 
                e.employee_name, 
                ee.department,
                ee.designation,
                COALESCE(a.status, 'Absent') as status,
                TIME_FORMAT(a.clock_in, '%H:%i') as clock_in,
                TIME_FORMAT(a.clock_out, '%H:%i') as clock_out
            FROM Employees e
            LEFT JOIN Employee_Employment ee ON e.employee_id = ee.employee_id
            LEFT JOIN Attendance a ON e.employee_id = a.employee_id AND a.attendance_date = ?
            ORDER BY e.employee_name ASC
        `;

        const [results] = await connection.query(sql, [date]);
        res.json(results);
    } catch (err) {
        console.error("Error fetching attendance:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

// ✅ POST: Save/Update Attendance
router.post('/', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { employee_id, date, status, clock_in, clock_out } = req.body;

        const inTime = clock_in ? clock_in : null;
        const outTime = clock_out ? clock_out : null;

        const sql = `
            INSERT INTO Attendance (employee_id, attendance_date, status, clock_in, clock_out) 
            VALUES (?, ?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE 
                status = VALUES(status), 
                clock_in = VALUES(clock_in), 
                clock_out = VALUES(clock_out)
        `;

        await connection.query(sql, [employee_id, date, status, inTime, outTime]);
        res.json({ message: 'Saved successfully' });
    } catch (err) {
        console.error("Error saving attendance:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;