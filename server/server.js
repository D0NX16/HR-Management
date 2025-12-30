const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const pool = require('./db'); // Assuming db.js now exports your database connection pool

const departmentsRouter = require('./departments');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve frontend
app.use('/api/departments', departmentsRouter);

// --- EXPENSE MANAGEMENT ROUTES ---

// ✅ ADD new expense
app.post('/api/expenses', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { invoice_no, client_name, expense_date, expense_type, status, amount } = req.body;

    if (!invoice_no || !client_name || !expense_date || !expense_type || !status || amount === undefined) {
      return res.status(400).json({ error: 'All expense fields are required.' });
    }

    const sql = 'INSERT INTO Expenses (invoice_no, client_name, expense_date, expense_type, status, amount) VALUES (?, ?, ?, ?, ?, ?)';
    const [result] = await connection.query(sql, [invoice_no, client_name, expense_date, expense_type, status, amount]);

    res.status(201).json({ message: '✅ Expense added successfully!', expenseId: result.insertId });
  } catch (err) {
    console.error('Error adding expense:', err);
    if (err.code === 'ER_DUP_ENTRY' && err.message.includes('invoice_no')) {
      return res.status(409).json({ error: 'Invoice number already exists.' });
    }
    res.status(500).json({ error: 'Internal server error adding expense.' });
  } finally {
    if (connection) connection.release();
  }
});

// ✅ GET all expenses
app.get('/api/expenses', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.query('SELECT id, invoice_no, client_name, DATE_FORMAT(expense_date, "%Y-%m-%d") AS expense_date, expense_type, status, amount FROM Expenses ORDER BY expense_date DESC');
    res.json(results);
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// ✅ GET single expense by ID
app.get('/api/expenses/:id', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { id } = req.params;
    const [results] = await connection.query('SELECT id, invoice_no, client_name, DATE_FORMAT(expense_date, "%Y-%m-%d") AS expense_date, expense_type, status, amount FROM Expenses WHERE id = ?', [id]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'Expense not found.' });
    }
    res.json(results[0]);
  } catch (err) {
    console.error('Error fetching expense:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// ✅ UPDATE expense
app.put('/api/expenses/:id', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { id } = req.params;
    const { invoice_no, client_name, expense_date, expense_type, status, amount } = req.body;

    if (!invoice_no || !client_name || !expense_date || !expense_type || !status || amount === undefined) {
      return res.status(400).json({ error: 'All expense fields are required for update.' });
    }

    const sql = 'UPDATE Expenses SET invoice_no = ?, client_name = ?, expense_date = ?, expense_type = ?, status = ?, amount = ? WHERE id = ?';
    const [result] = await connection.query(sql, [invoice_no, client_name, expense_date, expense_type, status, amount, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Expense not found or no changes made.' });
    }
    res.json({ message: '✅ Expense updated successfully!' });
  } catch (err) {
    console.error('Error updating expense:', err);
    if (err.code === 'ER_DUP_ENTRY' && err.message.includes('invoice_no')) {
      return res.status(409).json({ error: 'Invoice number already in use by another expense.' });
    }
    res.status(500).json({ error: 'Internal server error updating expense.' });
  } finally {
    if (connection) connection.release();
  }
});

// ✅ DELETE expense
app.delete('/api/expenses/:id', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { id } = req.params;
    const [result] = await connection.query('DELETE FROM Expenses WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Expense not found.' });
    }
    res.json({ message: '✅ Expense deleted successfully!' });
  } catch (err) {
    console.error('Error deleting expense:', err);
    res.status(500).json({ error: 'Internal server error deleting expense.' });
  } finally {
    if (connection) connection.release();
  }
});

// --- USER AUTHENTICATION ROUTES ---

// ✅ GET all users (optional for testing)
app.get('/api/users', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.query('SELECT id, name, email FROM reg_users');
    res.json(results);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// ✅ GET a single user by ID (for editing)
app.get('/api/users/:id', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { id } = req.params;
    const [results] = await connection.query('SELECT id, name, email, role FROM reg_users WHERE id = ?', [id]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(results[0]);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.release();
  }
});


// ✅ SECURE REGISTER / ADD USER ROUTE (modified to allow setting role)
app.post('/api/reg_users', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { name, email, password, role } = req.body; // Added role

    // 1️⃣ Basic validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields (name, email, password, role) are required' });
    }

    // 2️⃣ Check if email already exists
    const [existingUsers] = await connection.query('SELECT id FROM reg_users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // 3️⃣ Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Save user securely with role
    const sql = 'INSERT INTO reg_users (name, email, password, role,) VALUES (?, ?, ?, ?)';
    const [insertResult] = await connection.query(sql, [name, email, hashedPassword, role]);

    res.status(201).json({
      message: '✅ User registration successful',
      user: { id: insertResult.insertId, name, email, role }
    });

  } catch (error) {
    console.error('User registration error:', error);
    res.status(500).json({ error: 'Internal server error during user registration' });
  } finally {
    if (connection) connection.release();
  }
});

// ✅ SECURE LOGIN ROUTE (no changes needed for user management)
app.post('/api/login', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const [results] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({
      message: '✅ Login successful',
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  } finally {
    if (connection) connection.release();
  }
});

// ✅ UPDATE user route
app.put('/api/users/:id', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { id } = req.params;
    const { name, email, role, password } = req.body; // Password is optional for update

    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email, and role are required for update.' });
    }

    let sql = 'UPDATE users SET name = ?, email = ?, role = ?';
    const values = [name, email, role];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      sql += ', password = ?';
      values.push(hashedPassword);
    }
    sql += ' WHERE id = ?';
    values.push(id);

    const [result] = await connection.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found or no changes made.' });
    }
    res.json({ message: '✅ User updated successfully!' });
  } catch (err) {
    console.error('Error updating user:', err);
    // Check for duplicate email error
    if (err.code === 'ER_DUP_ENTRY' && err.message.includes('email')) {
      return res.status(400).json({ error: 'Email already in use by another user.' });
    }
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.release();
  }
});


// ✅ DELETE user
app.delete('/api/users/:id', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { id } = req.params;
    const [result] = await connection.query('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json({ message: '✅ User deleted successfully!' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.release();
  }
});



// ✅ SECURE REGISTER ROUTE
app.post('/api/users', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { name, email, password } = req.body;

    // 1️⃣ Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // 2️⃣ Check if email already exists
    const [existingUsers] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // 3️⃣ Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Save user securely
    const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    const [insertResult] = await connection.query(sql, [name, email, hashedPassword]);

    res.status(201).json({
      message: '✅ Registration successful',
      user: { id: insertResult.insertId, name, email }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  } finally {
    if (connection) connection.release();
  }
});

// ✅ SECURE LOGIN ROUTE
app.post('/api/login', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { email, password } = req.body;

    // 1️⃣ Basic validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // 2️⃣ Find user by email
    const [results] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);

    if (results.length === 0) {
      // User not found
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = results[0];

    // 3️⃣ Compare provided password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // Passwords do not match
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 4️⃣ Login successful
    res.json({ message: '✅ Login successful', user: { id: user.id, name: user.name, email: user.email } });

    // In a real application, you would generate and send a JWT here
    // const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    // res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email } });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  } finally {
    if (connection) connection.release();
  }
});

// --- EMPLOYEE MANAGEMENT ROUTES (UPDATED) ---

// ✅ ADD EMPLOYEE ROUTE (UPDATED)
app.post('/api/employees', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const {
      // 1. Core Details
      email, employee_id, employee_name, company, caller_name, date_of_joining,
      dob, contact_number, alternate_phone_number, official_phone_number,
      personal_mail_id, official_mail_id, permanent_address, temporary_address,

      // 2. Employment Details
      branch, employment_type, designation, department, epf_no, esic_no,

      // 3. Personal Details
      marital_status, blood_group, emergency_contact_person_name, relationship_with_employee,
      emergency_contact_person_phone_number, employee_nominee_name, nominee_dob,
      nominee_relationship_with_employee, father_name, father_dob, father_phone_number,
      mother_name, mother_dob, mother_phone_number, spouse_name, spouse_dob, spouse_phone_number,
      child1_name, child1_dob, child2_name, child2_dob,

      // 4. Financial Details
      bank_name_branch, account_number, ifsc_number, net_take_home_salary
    } = req.body;

    // Basic Validation
    if (!employee_id || !employee_name || !email || !company || !employment_type) {
      return res.status(400).json({ error: 'Critical fields (ID, Name, Email, Company, Emp Type) are required.' });
    }

    await connection.beginTransaction();

    try {
      // 1. Insert into Employees (Added company)
      const employeesSql = `
        INSERT INTO Employees (
          employee_id, email, employee_name, company, caller_name, date_of_joining, dob,
          contact_number, alternate_phone_number, official_phone_number,
          personal_mail_id, official_mail_id, permanent_address, temporary_address
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await connection.query(employeesSql, [
        employee_id, email, employee_name, company, caller_name, date_of_joining, dob,
        contact_number, alternate_phone_number, official_phone_number,
        personal_mail_id, official_mail_id, permanent_address, temporary_address
      ]);

      // 2. Insert into Employee_Employment (Added employment_type)
      const employmentSql = `
        INSERT INTO Employee_Employment (
          employee_id, branch, employment_type, designation, department, epf_no, esic_no
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      await connection.query(employmentSql, [
        employee_id, branch, employment_type, designation, department, epf_no, esic_no
      ]);

      // 3. Insert into Employee_Personal_Details
      const personalSql = `
        INSERT INTO Employee_Personal_Details (
          employee_id, marital_status, blood_group, emergency_contact_person_name,
          emergency_contact_relationship, emergency_contact_phone_number,
          nominee_name, nominee_dob, nominee_relationship,
          father_name, father_dob, father_phone_number,
          mother_name, mother_dob, mother_phone_number,
          spouse_name, spouse_dob, spouse_phone_number,
          child1_name, child1_dob, child2_name, child2_dob
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await connection.query(personalSql, [
        employee_id, marital_status, blood_group, emergency_contact_person_name,
        relationship_with_employee, emergency_contact_person_phone_number,
        employee_nominee_name, nominee_dob, nominee_relationship_with_employee,
        father_name, father_dob, father_phone_number,
        mother_name, mother_dob, mother_phone_number,
        spouse_name, spouse_dob || null, spouse_phone_number,
        child1_name, child1_dob || null, child2_name, child2_dob || null
      ]);

      // 4. Insert into Employee_Financial (No changes needed here)
      const financialSql = `
        INSERT INTO Employee_Financial (
          employee_id, bank_name_branch, account_number, ifsc_number, net_take_home_salary
        ) VALUES (?, ?, ?, ?, ?)
      `;
      await connection.query(financialSql, [
        employee_id, bank_name_branch, account_number, ifsc_number, net_take_home_salary
      ]);

      await connection.commit();
      res.status(201).json({ message: '✅ Employee added successfully!', employeeId: employee_id });

    } catch (insertError) {
      await connection.rollback();
      console.error('Error adding employee:', insertError);
      res.status(500).json({ error: 'Database error: ' + insertError.message });
    }
  } catch (error) {
    console.error('Connection error:', error);
    res.status(500).json({ error: 'Server connection error.' });
  } finally {
    if (connection) connection.release();
  }
});

// ✅ SECURE LOGIN ROUTE (Modified to return user name)
app.post('/api/login', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { email, password } = req.body;

    // 1️⃣ Basic validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // 2️⃣ Find user by email
    const [results] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);

    if (results.length === 0) {
      // User not found
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = results[0];

    // 3️⃣ Compare provided password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // Passwords do not match
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 4️⃣ Login successful - Return user's ID and name
    res.json({
      message: '✅ Login successful',
      user: { id: user.id, name: user.name, email: user.email }
    });

    // In a real application, you would generate and send a JWT here
    // const token = jwt.sign({ id: user.id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1h' });
    // res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email } });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  } finally {
    if (connection) connection.release();
  }
});

// ... (rest of your server.js code)


// ✅ DELETE user (for testing)
app.delete('/api/users/:id', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { id } = req.params;
    const [result] = await connection.query('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json({ message: 'User deleted successfully!' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// ✅ GET all employees with combined data
app.get('/api/employees', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const sql = `
      SELECT
        e.employee_id,
        e.employee_name,
        e.contact_number AS phone,
        DATE_FORMAT(e.date_of_joining, '%d %M, %Y') AS join_date,
        ee.designation AS role,
        e.email,
        e.caller_name,
        DATE_FORMAT(e.dob, '%Y-%m-%d') AS dob,
        ee.branch,
        ee.department,
        ep.marital_status,
        ep.blood_group,
        e.alternate_phone_number,
        e.official_phone_number,
        e.personal_mail_id,
        e.official_mail_id,
        e.permanent_address,
        e.temporary_address,
        ep.emergency_contact_person_name,
        ep.emergency_contact_relationship AS relationship_with_employee,
        ep.emergency_contact_phone_number,
        ep.nominee_name AS employee_nominee_name,
        DATE_FORMAT(ep.nominee_dob, '%Y-%m-%d') AS nominee_dob,
        ep.nominee_relationship AS nominee_relationship_with_employee,
        ep.father_name,
        DATE_FORMAT(ep.father_dob, '%Y-%m-%d') AS father_dob,
        ep.father_phone_number,
        ep.mother_name,
        DATE_FORMAT(ep.mother_dob, '%Y-%m-%d') AS mother_dob,
        ep.mother_phone_number,
        ep.spouse_name,
        DATE_FORMAT(ep.spouse_dob, '%Y-%m-%d') AS spouse_dob,
        ep.spouse_phone_number,
        ep.child1_name,
        DATE_FORMAT(ep.child1_dob, '%Y-%m-%d') AS child1_dob,
        ep.child2_name,
        DATE_FORMAT(ep.child2_dob, '%Y-%m-%d') AS child2_dob,
        ee.epf_no,
        ee.esic_no,
        ef.bank_name_branch,
        ef.account_number,
        ef.ifsc_number,
        ef.net_take_home_salary
      FROM Employees AS e
      JOIN Employee_Employment AS ee ON e.employee_id = ee.employee_id
      JOIN Employee_Personal_Details AS ep ON e.employee_id = ep.employee_id
      JOIN Employee_Financial AS ef ON e.employee_id = ef.employee_id
    `;
    const [results] = await connection.query(sql);
    res.json(results);
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// ✅ DELETE EMPLOYEE ROUTE
app.delete('/api/employees/:employee_id', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { employee_id } = req.params;

    await connection.beginTransaction(); // Start transaction for cascaded deletes

    // Delete from child tables first due to foreign key constraints
    await connection.query('DELETE FROM Employee_Financial WHERE employee_id = ?', [employee_id]);
    await connection.query('DELETE FROM Employee_Personal_Details WHERE employee_id = ?', [employee_id]);
    await connection.query('DELETE FROM Employee_Employment WHERE employee_id = ?', [employee_id]);
    const [result] = await connection.query('DELETE FROM Employees WHERE employee_id = ?', [employee_id]);

    if (result.affectedRows === 0) {
      await connection.rollback(); // Rollback if the main employee was not found
      return res.status(404).json({ message: 'Employee not found.' });
    }

    await connection.commit(); // Commit if all successful
    res.json({ message: '✅ Employee deleted successfully!' });
  } catch (err) {
    await connection.rollback(); // Rollback on error
    console.error('Error deleting employee:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// ✅ UPDATE EMPLOYEE ROUTE
app.put('/api/employees/:employee_id', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { employee_id } = req.params;
    const {
      email, branch, employee_name, caller_name, date_of_joining, dob,
      designation, department, marital_status, blood_group, contact_number,
      alternate_phone_number, official_phone_number, personal_mail_id,
      official_mail_id, permanent_address, temporary_address,
      emergency_contact_person_name, relationship_with_employee,
      emergency_contact_person_phone_number, employee_nominee_name, nominee_dob,
      nominee_relationship_with_employee,
      father_name, father_dob, father_phone_number, mother_name, mother_dob,
      mother_phone_number, spouse_name, spouse_dob, spouse_phone_number,
      child1_name, child1_dob, child2_name, child2_dob, epf_no, esic_no,
      bank_name_branch, account_number, ifsc_number, net_take_home_salary
    } = req.body;

    // Basic validation for essential fields (expand as needed)
    if (!employee_id || !employee_name || !email || !date_of_joining || !dob ||
      !branch || !designation || !department || !contact_number || !personal_mail_id ||
      !permanent_address || !temporary_address || !emergency_contact_person_name ||
      !relationship_with_employee || !emergency_contact_person_phone_number ||
      !employee_nominee_name || !nominee_dob || !nominee_relationship_with_employee ||
      !father_name || !father_dob || !father_phone_number || !mother_name ||
      !mother_dob || !mother_phone_number || !epf_no || !esic_no ||
      !bank_name_branch || !account_number || !ifsc_number || !net_take_home_salary
    ) {
      return res.status(400).json({ error: 'Please fill in all required fields for employee update.' });
    }

    await connection.beginTransaction();

    // Update Employees table
    const employeesUpdateSql = `
      UPDATE Employees SET
        email = ?, employee_name = ?, caller_name = ?, date_of_joining = ?, dob = ?,
        contact_number = ?, alternate_phone_number = ?, official_phone_number = ?,
        personal_mail_id = ?, official_mail_id = ?, permanent_address = ?, temporary_address = ?
      WHERE employee_id = ?
    `;
    const employeesUpdateValues = [
      email, employee_name, caller_name, date_of_joining, dob,
      contact_number, alternate_phone_number, official_phone_number,
      personal_mail_id, official_mail_id, permanent_address, temporary_address,
      employee_id
    ];
    await connection.query(employeesUpdateSql, employeesUpdateValues);

    // Update Employee_Employment table
    const employmentUpdateSql = `
      UPDATE Employee_Employment SET
        branch = ?, designation = ?, department = ?, epf_no = ?, esic_no = ?
      WHERE employee_id = ?
    `;
    const employmentUpdateValues = [
      branch, designation, department, epf_no, esic_no,
      employee_id
    ];
    await connection.query(employmentUpdateSql, employmentUpdateValues);

    // Update Employee_Personal_Details table
    const personalUpdateSql = `
      UPDATE Employee_Personal_Details SET
        marital_status = ?, blood_group = ?, emergency_contact_person_name = ?,
        emergency_contact_relationship = ?, emergency_contact_phone_number = ?,
        nominee_name = ?, nominee_dob = ?, nominee_relationship = ?,
        father_name = ?, father_dob = ?, father_phone_number = ?,
        mother_name = ?, mother_dob = ?, mother_phone_number = ?,
        spouse_name = ?, spouse_dob = ?, spouse_phone_number = ?,
        child1_name = ?, child1_dob = ?, child2_name = ?, child2_dob = ?
      WHERE employee_id = ?
    `;
    const personalUpdateValues = [
      marital_status, blood_group, emergency_contact_person_name,
      relationship_with_employee, emergency_contact_phone_number,
      employee_nominee_name, nominee_dob, nominee_relationship_with_employee,
      father_name, father_dob, father_phone_number,
      mother_name, mother_dob, mother_phone_number,
      spouse_name, spouse_dob, spouse_phone_number,
      child1_name, child1_dob, child2_name, child2_dob,
      employee_id
    ];
    await connection.query(personalUpdateSql, personalUpdateValues);

    // Update Employee_Financial table
    const financialUpdateSql = `
      UPDATE Employee_Financial SET
        bank_name_branch = ?, account_number = ?, ifsc_number = ?, net_take_home_salary = ?
      WHERE employee_id = ?
    `;
    const financialUpdateValues = [
      bank_name_branch, account_number, ifsc_number, net_take_home_salary,
      employee_id
    ];
    await connection.query(financialUpdateSql, financialUpdateValues);

    await connection.commit();
    res.json({ message: '✅ Employee updated successfully!' });

  } catch (error) {
    await connection.rollback();
    console.error('Error updating employee:', error);
    res.status(500).json({ error: error.message || 'Internal server error during update.' });
  } finally {
    if (connection) connection.release();
  }
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
