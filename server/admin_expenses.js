const express = require("express");
const router = express.Router();
const pool = require("./db");
const xlsx = require("xlsx");
const fs = require("fs");
const multer = require("multer");

const upload = multer({ dest: "uploads/temp/" });
// ✅ GET all expenses
// Note: Ensure your main server.js mounts this with a prefix or handles '/api'
// Example main server: app.use(expenseRoutes);
router.get("/api/expenses", async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.query(
      "SELECT id,client_name, expense_date, expense_type, status, amount FROM Expenses ORDER BY expense_date DESC",
    );
    res.json(results);
  } catch (err) {
    console.error("Error fetching expenses:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// ✅ ADD new expense
router.post("/api/expenses", async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    const { client_name, expense_date, expense_type, status, amount } =
      req.body;
    console.log(req.body);
    if (
      !client_name ||
      !expense_date ||
      !expense_type ||
      !status ||
      amount === undefined
    ) {
      return res.status(400).json({ error: req.body });
    }

    const sql =
      "INSERT INTO Expenses (client_name, expense_date, expense_type, status, amount) VALUES (?, ?, ?, ?, ?)";
    const [result] = await connection.query(sql, [
      client_name,
      expense_date,
      expense_type,
      status,
      amount,
    ]);

    res.status(201).json({
      message: "✅ Expense added successfully!",
      expenseId: result.insertId,
    });
  } catch (err) {
    console.error("Error adding expense:", err);
    res.status(500).json({ error: "Internal server error adding expense." });
  } finally {
    if (connection) connection.release();
  }
});

// ✅ GET single expense by ID
router.get("/api/expenses/:id", async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { id } = req.params;
    const [results] = await connection.query(
      "SELECT id, client_name, expense_date, expense_type, status, amount FROM Expenses WHERE id = ?",
      [id],
    );
    if (results.length === 0) {
      return res.status(404).json({ message: "Expense not found." });
    }
    res.json(results[0]);
  } catch (err) {
    console.error("Error fetching expense:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// ✅ UPDATE expense
router.put("/api/expenses/:id", async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { id } = req.params;
    const { client_name, expense_date, expense_type, status, amount } =
      req.body;

    if (!expense_date || !expense_type || !status || amount === undefined) {
      return res
        .status(400)
        .json({ error: "All expense fields are required for update." });
    }

    const sql =
      "UPDATE Expenses SET client_name = ?, expense_date = ?, expense_type = ?, status = ?, amount = ? WHERE id = ?";
    const [result] = await connection.query(sql, [
      client_name,
      expense_date,
      expense_type,
      status,
      amount,
      id,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Expense not found or no changes made." });
    }
    res.json({ message: "✅ Expense updated successfully!" });
  } catch (err) {
    console.error("Error updating expense:", err);
    res.status(500).json({ error: "Internal server error updating expense." });
  } finally {
    if (connection) connection.release();
  }
});

// ✅ DELETE expense
router.delete("/api/expenses/:id", async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { id } = req.params;
    const [result] = await connection.query(
      "DELETE FROM Expenses WHERE id = ?",
      [id],
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Expense not found." });
    }
    res.json({ message: "✅ Expense deleted successfully!" });
  } catch (err) {
    console.error("Error deleting expense:", err);
    res.status(500).json({ error: "Internal server error deleting expense." });
  } finally {
    if (connection) connection.release();
  }
});

function getExactExcelDatePlusOne(date) {
  if (!date || !(date instanceof Date)) {
    const today = new Date();
    today.setDate(today.getDate() + 1); // add 1 day
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  }
  const d = new Date(date);
  d.setDate(d.getDate() + 1); // add 1 day
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

router.post("/api/expenses/upload", upload.single("file"), async (req, res) => {
  let connection;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Read Excel from TEMP path
    const workbook = xlsx.readFile(req.file.path, { cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    if (data.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Excel file is empty" });
    }

    const values = data.map((row) => [
      row["Client Name"] || "",
      getExactExcelDatePlusOne(row["Expense Date"]),
      row["Expense Type"] || "",
      row["Status"] || "",
      row["Amount"] || 0,
    ]);

    connection = await pool.getConnection();

    const sql = `
            INSERT INTO expenses
            (client_name, expense_date, expense_type, status, amount)
            VALUES ?
        `;

    await connection.query(sql, [values]);

    // ✅ DELETE TEMP FILE AFTER SUCCESS
    fs.unlinkSync(req.file.path);

    res.json({
      message: `✅ ${values.length} expenses imported successfully`,
    });
  } catch (err) {
    console.error("Expense Upload Error:", err);

    // Cleanup temp file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
