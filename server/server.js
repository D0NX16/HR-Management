const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const pool = require('./db');
const fs = require("fs");
const path = require("path");
const xlsx = require('xlsx');
const multer = require('multer');
dotenv.config();
const app = express();


// If you are moving all code into server.js, you can com t these out.
const departmentsRouter = require('./departments');
const performanceRouter = require('./employee_performance');
const detailedPerformanceRouter = require('./detailed_performance');
const adminReportRouter = require('./admin_report');
const hrDailyReportsRouter = require('./hr_daily_reports'); 
const hrInterviewReportsRouter = require('./hr_report'); 
const hrtimesheetRouter = require('./hr_timesheet');
const interviewSchedulesRouter = require('./hr_interview_schedules');
const appointedCandidatesRouter = require('./appointed_candidates');
const expensesRouter = require('./admin_expenses');
const attendanceRouter = require('./hr_attendance');
const resignedCandidatesRoutes = require('./hr_resigned_candidates');
const otherPortalsRoutes = require('./other_portals');
const payslipRoutes = require('./payslip');
const paymentBillsRouter = require('./payment_bills');
const userRoutes = require('./user-Routes');
const leaveRequestRoutes = require('./leave_requests');
const clientRoutes = require('./client');
const quotationRoutes = require('./quotation');
const proformaRouter = require('./proforma');
const documentCollectionRouter = require('./documentCollection');
const backendID = require('./backend_ID');
const balancePaymentRouter = require('./balance_Payment');
const backendTasksRouter = require('./backend_task');
const billSupplyRouter = require('./bill_Supply');
const historyLicensesRouter = require('./history_License');
const hacbackendreportsRouter = require('./HACbackend_report');
const sopTracker = require('./sop_Tracker');
const outputSheetRouter = require('./outputSheet');
const forgetPassword=require('./forget_password');
const auditQuotation=require('./audit_quotation');
const enquiry=require('./enquiry');
const appointmentsRouter = require('./audit_appointments');
const operatorsRouter=require('./operators');
const pgEnquiry=require('./pg_enquiry');
const  smEnquiry=require('./sm_enquries');
const audit_weekly_reports=require('./audit_weekly_report');
const Phone_audit =require('./phone_audit_report');
const audit_base=require('./audit_base');
const qcSheet=require('./Qc-sheet');
const advisorEntry=require('./advisor_entry_sheet');
const accounting_log=require('./accounting_log');
const comments =require('./comments');
const social_report =require('./social-media-report');
const advisor_performance_tracker =require('./advisor_performance_tracker');
const performance_tracker=require('./performance_tracker');
const asset_master_register=require('./asset_master_register');
const branch_asset_summary =require('./branch_asset_summary');
const assetIssueRoute = require('./asset-issue-register');
const assetMovementRoute = require('./asset-movement-register');
const assetMaintenanceRoute = require('./asset_maintanance_log');
const assetverification =require('./asset_verification');
const assetdisposal =require('./asset_disposal_register');
const mediaenquiry =require('./media_enquiry');
const category =require('./category');
const office_visits=require('./office_vists');
const applied_visits=require('./applied_visit');
const nomination_tracker=require('./nomination_tracker');
const media_accounting_log=require('./media_accounting_log');
const landmark_enquiry=require('./landmark_enquiry');
const site_visit=require('./site_visit');
const landmark_office_visit=require('./landmark_office_visit');
const landmarkDocumentTrackerRoute=require('./landmark_document_tracker');
const landmarkAppliedListRoute=require('./landmark_applied_list');
const LandmarkAccountingLog=require('./landmark_accounting_log');
const eb_bill=require('./eb_bill');
const recharge=require('./recharge_bill');
const internet_bills=require('./internet-bill');
const rent_payments=require('./rent_payment');
const vendorpayment=require('./vendor_payment');
const vendor_directory=require('./vendor_directory');
const business_Report=require('./business_report');
const compliance_tracker=require('./compliance_tracker');
const inventory=require('./inventory');
const meeting_tracker=require('./meeting');
const software_access_register=require('./software_access');
const petrol_allowance=require('./petrol_Allowance');
const employee_tasks=require('./daily-task');
const interviewTrackerRouter = require('./interview_tracker');

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(express.static(path.join(__dirname, '..')));
app.use(hrtimesheetRouter);
app.use(interviewSchedulesRouter);
app.use(expensesRouter);

// Mount external routers if they exist
app.use('/api/departments', departmentsRouter);
app.use('/api/performance', performanceRouter);
app.use('/api/admin_reports', adminReportRouter);
app.use('/api/detailed-performance', detailedPerformanceRouter);
app.use('/api/appointed_candidates', appointedCandidatesRouter);
app.use('/api/attendance', attendanceRouter)
app.use('/api/resigned-candidates', resignedCandidatesRoutes);
app.use('/api/other-portals', otherPortalsRoutes);
app.use('/api/payslip', payslipRoutes);
app.use('/api/payment_bills', paymentBillsRouter);
app.use('/api/users', userRoutes);
app.use('/api/HrInterviewReport', hrInterviewReportsRouter);
app.use('/api/hr_daily_reports', hrDailyReportsRouter);
app.use('/api/leave-requests', leaveRequestRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/proforma', proformaRouter);
app.use('/api/documents', documentCollectionRouter);
app.use('/api/backend-id', backendID);
app.use('/api/balance-payment', balancePaymentRouter);
app.use('/api/backend-tasks', backendTasksRouter);
app.use('/api/bill-supply', billSupplyRouter);
app.use('/api/history-licenses', historyLicensesRouter);
app.use('/api/hac-backend-reports', hacbackendreportsRouter);
app.use('/api/sop-tracker', sopTracker);
app.use('/api/output-sheet', outputSheetRouter);
app.use('/api/forgot-password',forgetPassword)
app.use('/api/audit_quotation',auditQuotation);
app.use('/api/enquiry',enquiry);
app.use('/api/audit-appointments', appointmentsRouter);
app.use('/api/operators',operatorsRouter);
app.use('/api/pg-enquiries',pgEnquiry);
app.use('/api/sm-enquiries', smEnquiry);
app.use('/api/audit-weekly-reports',audit_weekly_reports);
app.use('/api/phone-audit-reports',Phone_audit);
app.use('/api/base-reports',audit_base);
app.use('/api/qc-sheets',qcSheet);
app.use('/api/advisor_entry',advisorEntry);
app.use('/api/accounting-log',accounting_log);
app.use(comments);
app.use('/api/social-media',social_report);
app.use('/api/advisor-performance',advisor_performance_tracker);
app.use('/api/performance-tracker',performance_tracker);
app.use('/api/asset-master-register',asset_master_register);
app.use('/api/branch-asset-summary',branch_asset_summary);
app.use('/api/asset-issue-register', assetIssueRoute);
app.use('/api/asset-movement-register', assetMovementRoute);
app.use('/api/asset-maintenance-log', assetMaintenanceRoute);
app.use('/api/asset-verification', assetverification); 
app.use('/api/asset-disposal',assetdisposal);
app.use('/api/media-enquiry',mediaenquiry);
app.use('/api/category',category);
app.use('/api/office-visit',office_visits);
app.use('/api/applied-visit',applied_visits);
app.use('/api/nomination-tracker',nomination_tracker);
app.use('/api/media-accounting-log',media_accounting_log);
app.use('/api/landmark-enquiry',landmark_enquiry);
app.use('/api/site-visit',site_visit);
app.use('/api/landmark-office-visit',landmark_office_visit);
app.use('/api/landmark-document-tracker', landmarkDocumentTrackerRoute);
app.use('/api/landmark-applied-list', landmarkAppliedListRoute);
app.use('/api/landmark-accounting-log',LandmarkAccountingLog);
app.use('/api/eb-bills',eb_bill);
app.use('/api/mobile-recharges',recharge);
app.use('/api/internet-bills',internet_bills);
app.use('/api/rent-payments',rent_payments);
app.use('/api/vendor-payments', vendorpayment);
app.use('/api/vendor-directory',vendor_directory);
app.use('/api/business-reports', business_Report);
app.use('/api/compliance-tracker',compliance_tracker);
app.use('/api/inventory',inventory);
app.use('/api/meeting-tracker',meeting_tracker);
app.use('/api/software-access',software_access_register);
app.use('/api/petrol-allowances',petrol_allowance);
app.use('/api/employee-tasks',employee_tasks);
app.use('/api/interview-tracker', interviewTrackerRouter);

// --- USER AUTHENTICATION ROUTES ---

// In server.js - Update the GET /api/users route
app.get('/api/users', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    // ✅ Added 'role' and 'created_at' to the SELECT statement
    const [results] = await connection.query('SELECT id, name, email, role, created_at FROM users ORDER BY id DESC');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// ✅ GET a single user by ID
app.get('/api/users/:id', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { id } = req.params;
    const [results] = await connection.query('SELECT id, name, email, role FROM users WHERE id = ?', [id]);
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

// --- USER AUTHENTICATION ROUTES (Place this in server.js) ---

// 1. REGISTER USER
app.post('/api/users', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { name, email, password, role } = req.body;

    // Validate that 'role' is present
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required' });
    }

    // Check if user exists
    const [existingUsers] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = 'INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())';
    const [insertResult] = await connection.query(sql, [name, email, hashedPassword, role]);

    res.status(201).json({
      message: '✅ User registration successful',
      user: { id: insertResult.insertId, name, email, role }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (connection) connection.release();
  }
});

// 2. LOGIN USER
app.post('/api/login', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // 1. Get User
    const [results] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // --- NEW CODE START ---
    // 2. Update last_login to current time
    await connection.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    // 3. Fetch the formatted time to send back to frontend (Optional, or just use JS Date)
    const [updatedUser] = await connection.query('SELECT last_login FROM users WHERE id = ?', [user.id]);
    const lastLoginTime = updatedUser[0].last_login;
    // --- NEW CODE END ---

    res.json({
      message: '✅ Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        last_login: lastLoginTime // Send this to frontend
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
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
    const { name, email, role, password } = req.body;

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

// --- EMPLOYEE MANAGEMENT ROUTES ---

app.post('/api/employees/add', async (req, res) => {
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
      // 1. Insert into Employees
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

      // 2. Insert into Employee_Employment
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

      // 4. Insert into Employee_Financial
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

    await connection.beginTransaction();

    // Delete from child tables first
    await connection.query('DELETE FROM Employee_Financial WHERE employee_id = ?', [employee_id]);
    await connection.query('DELETE FROM Employee_Personal_Details WHERE employee_id = ?', [employee_id]);
    await connection.query('DELETE FROM Employee_Employment WHERE employee_id = ?', [employee_id]);
    const [result] = await connection.query('DELETE FROM Employees WHERE employee_id = ?', [employee_id]);

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Employee not found.' });
    }

    await connection.commit();
    res.json({ message: '✅ Employee deleted successfully!' });
  } catch (err) {
    await connection.rollback();
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

    if (!employee_id || !employee_name || !email) {
      return res.status(400).json({ error: 'Please fill in required fields.' });
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
      relationship_with_employee, emergency_contact_person_phone_number,
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

// --- EMPLOYEE PERFORMANCE ROUTES ---

// ✅ GET Performance List
app.get('/api/employee-performance', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const currentMonth = req.query.month || new Date().toISOString().slice(0, 7);
    const sql = `
            SELECT 
                e.employee_id, 
                e.employee_name, 
                ee.department, 
                ee.designation, 
                ep.performance_score,
                ep.comments
            FROM Employees e
            LEFT JOIN Employee_Employment ee ON e.employee_id = ee.employee_id
            LEFT JOIN Employee_Performance ep ON e.employee_id = ep.employee_id AND ep.evaluation_month = ?
            ORDER BY e.employee_name ASC
        `;
    const [results] = await connection.query(sql, [currentMonth]);
    res.json(results);
  } catch (err) {
    console.error('Error fetching performance:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// ✅ SAVE / UPDATE Performance Score
app.post('/api/employee-performance', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { employee_id, performance_score, comments, month } = req.body;

    if (!employee_id || performance_score === undefined) {
      return res.status(400).json({ error: 'Employee ID and Score are required.' });
    }
    const evaluation_month = month || new Date().toISOString().slice(0, 7);
    const sql = `
            INSERT INTO Employee_Performance (employee_id, performance_score, comments, evaluation_month) 
            VALUES (?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE 
            performance_score = VALUES(performance_score),
            comments = VALUES(comments)
        `;
    await connection.query(sql, [employee_id, performance_score, comments || '', evaluation_month]);
    res.json({ message: '✅ Performance updated successfully!' });
  } catch (err) {
    console.error('Error updating performance:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// --- APPRAISAL WORKFLOW ROUTES ---

// 1. GET / Create Appraisal Cycles
app.get('/api/appraisal-cycles', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.query('SELECT * FROM Appraisal_Cycles ORDER BY start_date DESC');
    res.json(results);
  } catch (err) { res.status(500).json({ error: err.message }); }
  finally { if (connection) connection.release(); }
});

app.post('/api/appraisal-cycles', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { title, start_date, end_date } = req.body;
    await connection.query('INSERT INTO Appraisal_Cycles (title, start_date, end_date) VALUES (?, ?, ?)', [title, start_date, end_date]);
    res.json({ message: '✅ Cycle created successfully!' });
  } catch (err) { res.status(500).json({ error: err.message }); }
  finally { if (connection) connection.release(); }
});

// 2. Initialize Appraisal for All Employees
app.post('/api/appraisal/initiate', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { cycle_id } = req.body;
    const [employees] = await connection.query('SELECT employee_id FROM Employees');
    const [params] = await connection.query('SELECT id FROM Appraisal_Parameters');
    for (const emp of employees) {
      const [exists] = await connection.query('SELECT id FROM Employee_Appraisals WHERE cycle_id = ? AND employee_id = ?', [cycle_id, emp.employee_id]);
      if (exists.length === 0) {
        const [header] = await connection.query('INSERT INTO Employee_Appraisals (cycle_id, employee_id, status) VALUES (?, ?, "Self Evaluation")', [cycle_id, emp.employee_id]);
        const appraisalId = header.insertId;
        for (const p of params) {
          await connection.query('INSERT INTO Appraisal_Ratings (appraisal_id, parameter_id) VALUES (?, ?)', [appraisalId, p.id]);
        }
      }
    }
    res.json({ message: '✅ Appraisals initiated for all employees.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
  finally { if (connection) connection.release(); }
});

// 3. GET Appraisal List
app.get('/api/appraisals', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const cycle_id = req.query.cycle_id;
    const sql = `
            SELECT a.id, e.employee_name, e.employee_id, ee.department, ee.designation, a.status, a.final_score
            FROM Employee_Appraisals a
            JOIN Employees e ON a.employee_id = e.employee_id
            JOIN Employee_Employment ee ON e.employee_id = ee.employee_id
            WHERE a.cycle_id = ?
        `;
    const [results] = await connection.query(sql, [cycle_id]);
    res.json(results);
  } catch (err) { res.status(500).json({ error: err.message }); }
  finally { if (connection) connection.release(); }
});

// 4. GET Single Appraisal Details
app.get('/api/appraisal-details/:appraisal_id', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { appraisal_id } = req.params;
    const [header] = await connection.query(`
            SELECT a.*, e.employee_name, c.title as cycle_title 
            FROM Employee_Appraisals a 
            JOIN Employees e ON a.employee_id = e.employee_id
            JOIN Appraisal_Cycles c ON a.cycle_id = c.id
            WHERE a.id = ?`, [appraisal_id]);
    const [ratings] = await connection.query(`
            SELECT r.id, r.self_rating, r.manager_rating, p.category_name, p.description
            FROM Appraisal_Ratings r
            JOIN Appraisal_Parameters p ON r.parameter_id = p.id
            WHERE r.appraisal_id = ?`, [appraisal_id]);
    res.json({ header: header[0], ratings: ratings });
  } catch (err) { res.status(500).json({ error: err.message }); }
  finally { if (connection) connection.release(); }
});

// 5. UPDATE Appraisal
app.put('/api/appraisal/update', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { appraisal_id, ratings, stage, hr_remarks } = req.body;

    await connection.beginTransaction();

    if (stage === 'self') {
      for (const r of ratings) {
        await connection.query('UPDATE Appraisal_Ratings SET self_rating = ? WHERE id = ?', [r.value, r.id]);
      }
      await connection.query('UPDATE Employee_Appraisals SET status = "Manager Review" WHERE id = ?', [appraisal_id]);
    }
    else if (stage === 'manager') {
      let totalScore = 0;
      let count = 0;
      for (const r of ratings) {
        await connection.query('UPDATE Appraisal_Ratings SET manager_rating = ? WHERE id = ?', [r.value, r.id]);
        totalScore += parseInt(r.value);
        count++;
      }
      const finalScore = (totalScore / count).toFixed(2);
      await connection.query('UPDATE Employee_Appraisals SET status = "HR Review", final_score = ? WHERE id = ?', [finalScore, appraisal_id]);
    }
    else if (stage === 'hr') {
      await connection.query('UPDATE Employee_Appraisals SET status = "Completed", hr_remarks = ? WHERE id = ?', [hr_remarks, appraisal_id]);
    }

    await connection.commit();
    res.json({ message: '✅ Appraisal updated successfully!' });
  } catch (err) {
    if (connection) await connection.rollback();
    res.status(500).json({ error: err.message });
  }
  finally { if (connection) connection.release(); }
});

// --- FILE UPLOAD CONFIGURATION ---
const uploadDir = 'uploads/performance_docs';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'DOC-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// ==========================================
// PART 1: DETAILED PERFORMANCE REVIEW ROUTES
// ==========================================
// Defined as a local router to avoid path collisions, or mounted directly on app

// GET: Fetch performance details
app.get('/api/detailed-performance/details', async (req, res) => {
  let connection;
  try {
    const { employee_id, month } = req.query;
    if (!employee_id || !month) return res.status(400).json({ error: "Missing params" });

    connection = await pool.getConnection();
    const sql = `SELECT * FROM employee_monthly_reviews WHERE employee_id = ? AND evaluation_month = ?`;
    const [rows] = await connection.query(sql, [employee_id, month]);

    res.json(rows.length > 0 ? rows[0] : null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// POST: Save Performance
app.post('/api/detailed-performance/save', upload.single('document'), async (req, res) => {
  let connection;
  try {
    const {
      employee_id, employee_name, evaluation_month,
      avg_in_time, avg_out_time, permissions_taken, leaves_taken,
      uniform_worn, work_completion, creativity_score, comments
    } = req.body;

    const document_path = req.file ? req.file.path : null;

    connection = await pool.getConnection();

    const [existing] = await connection.query(
      `SELECT id FROM employee_monthly_reviews WHERE employee_id = ? AND evaluation_month = ?`,
      [employee_id, evaluation_month]
    );

    if (existing.length > 0) {
      let sql = `UPDATE employee_monthly_reviews SET 
                avg_in_time=?, avg_out_time=?, permissions_taken=?, leaves_taken=?,
                uniform_worn=?, work_completion=?, creativity_score=?, comments=?`;
      const params = [avg_in_time, avg_out_time, permissions_taken, leaves_taken, uniform_worn, work_completion, creativity_score, comments];

      if (document_path) {
        sql += `, document_path=?`;
        params.push(document_path);
      }
      sql += ` WHERE id=?`;
      params.push(existing[0].id);

      await connection.query(sql, params);
    } else {
      const sql = `INSERT INTO employee_monthly_reviews 
                (employee_id, employee_name, evaluation_month, avg_in_time, avg_out_time, permissions_taken, leaves_taken, uniform_worn, work_completion, creativity_score, comments, document_path)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      await connection.query(sql, [employee_id, employee_name, evaluation_month, avg_in_time, avg_out_time, permissions_taken, leaves_taken, uniform_worn, work_completion, creativity_score, comments, document_path]);
    }
    res.json({ message: "Saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// ==========================================
// PART 2: EXTENDED EMPLOYEE MANAGEMENT (CRUD)
// ==========================================

// 1. GET ALL EMPLOYEES (Simple List)
app.get('/api/detailed-performance/list', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const sql = `
            SELECT 
                e.employee_id as id, 
                e.employee_name as name, 
                e.email,
                ee.designation, 
                ee.department 
            FROM Employees e
            LEFT JOIN Employee_Employment ee ON e.employee_id = ee.employee_id
            ORDER BY e.employee_name ASC
        `;
    const [rows] = await connection.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("GET /list error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// 2. ADD EMPLOYEE (Extended)
app.post('/api/detailed-performance/add', async (req, res) => {
  let connection;
  try {
    const { name, email, designation, department } = req.body;

    if (!name || !email) return res.status(400).json({ error: "Name and Email required" });

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const empId = 'EMP' + Math.floor(1000 + Math.random() * 9000);

    await connection.query(
      `INSERT INTO Employees (employee_id, employee_name, email, company, employment_type) VALUES (?, ?, ?, 'Kalsun', 'Full Time')`,
      [empId, name, email]
    );

    await connection.query(
      `INSERT INTO Employee_Employment (employee_id, designation, department) VALUES (?, ?, ?)`,
      [empId, designation, department]
    );

    await connection.commit();
    res.status(201).json({ message: "Employee added", id: empId });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("POST /add error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// 3. UPDATE EMPLOYEE (Extended)
app.put('/api/detailed-performance/update/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { name, email, designation, department } = req.body;

    connection = await pool.getConnection();
    await connection.beginTransaction();

    await connection.query(
      `UPDATE Employees SET employee_name = ?, email = ? WHERE employee_id = ?`,
      [name, email, id]
    );

    const [exists] = await connection.query(`SELECT * FROM Employee_Employment WHERE employee_id = ?`, [id]);

    if (exists.length > 0) {
      await connection.query(
        `UPDATE Employee_Employment SET designation = ?, department = ? WHERE employee_id = ?`,
        [designation, department, id]
      );
    } else {
      await connection.query(
        `INSERT INTO Employee_Employment (employee_id, designation, department) VALUES (?, ?, ?)`,
        [id, designation, department]
      );
    }

    await connection.commit();
    res.json({ message: "Updated successfully" });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// 4. DELETE EMPLOYEE (Extended)
app.delete('/api/detailed-performance/delete/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await pool.getConnection();
    await connection.beginTransaction();

    await connection.query(`DELETE FROM Employee_Employment WHERE employee_id = ?`, [id]);
    await connection.query(`DELETE FROM employee_monthly_reviews WHERE employee_id = ?`, [id]);
    await connection.query(`DELETE FROM Employees WHERE employee_id = ?`, [id]);

    await connection.commit();
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// ✅ DELETE user by ID
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
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

function formatExcelDate(value) {
    if (!value) return null;

    if (value instanceof Date) {
        return value.toISOString().slice(0, 10);
    }

    // if string like 2025-01-30
    return value;
}



app.post('/api/employees/upload-excel', upload.single('file'), async (req, res) => {
    let connection;

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Excel file is required' });
        }

        const workbook = xlsx.readFile(req.file.path, { cellDates: true });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = xlsx.utils.sheet_to_json(sheet);

        if (!rows.length) {
            return res.status(400).json({ error: 'Excel file is empty' });
        }

        connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            for (const row of rows) {

                // 🔴 Mandatory check
                if (!row.employee_id || !row.employee_name || !row.email) {
                    throw new Error(`Missing required fields for employee_id: ${row.employee_id || 'UNKNOWN'}`);
                }

                // 1️⃣ Employees
                await connection.query(`
                    INSERT INTO Employees (
                        employee_id, email, employee_name, company, caller_name,
                        date_of_joining, dob, contact_number, alternate_phone_number,
                        official_phone_number, personal_mail_id, official_mail_id,
                        permanent_address, temporary_address
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    row.employee_id,
                    row.email,
                    row.employee_name,
                    row.company,
                    row.caller_name,
                    formatExcelDate(row.date_of_joining),
                    formatExcelDate(row.dob),
                    row.contact_number,
                    row.alternate_phone_number,
                    row.official_phone_number,
                    row.personal_mail_id,
                    row.official_mail_id,
                    row.permanent_address,
                    row.temporary_address
                ]);

                // 2️⃣ Employment
                await connection.query(`
                    INSERT INTO Employee_Employment (
                        employee_id, branch, employment_type, designation,
                        department, epf_no, esic_no
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [
                    row.employee_id,
                    row.branch,
                    row.employment_type,
                    row.designation,
                    row.department,
                    row.epf_no,
                    row.esic_no
                ]);

                // 3️⃣ Personal
                await connection.query(`
                    INSERT INTO Employee_Personal_Details (
                        employee_id, marital_status, blood_group,
                        emergency_contact_person_name,
                        emergency_contact_relationship,
                        emergency_contact_phone_number,
                        nominee_name, nominee_dob, nominee_relationship,
                        father_name, father_dob, father_phone_number,
                        mother_name, mother_dob, mother_phone_number,
                        spouse_name, spouse_dob, spouse_phone_number,
                        child1_name, child1_dob, child2_name, child2_dob
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    row.employee_id,
                    row.marital_status,
                    row.blood_group,
                    row.emergency_contact_person_name,
                    row.relationship_with_employee,
                    row.emergency_contact_person_phone_number,
                    row.employee_nominee_name,
                    formatExcelDate(row.nominee_dob),
                    row.nominee_relationship_with_employee,
                    row.father_name,
                    formatExcelDate(row.father_dob),
                    row.father_phone_number,
                    row.mother_name,
                    formatExcelDate(row.mother_dob),
                    row.mother_phone_number,
                    row.spouse_name,
                    formatExcelDate(row.spouse_dob),
                    row.spouse_phone_number,
                    row.child1_name,
                    formatExcelDate(row.child1_dob),
                    row.child2_name,
                    formatExcelDate(row.child2_dob)
                ]);

                // 4️⃣ Financial
                await connection.query(`
                    INSERT INTO Employee_Financial (
                        employee_id, bank_name_branch, account_number,
                        ifsc_number, net_take_home_salary
                    ) VALUES (?, ?, ?, ?, ?)
                `, [
                    row.employee_id,
                    row.bank_name_branch,
                    row.account_number,
                    row.ifsc_number,
                    row.net_take_home_salary
                ]);
            }

            await connection.commit();
            res.json({ message: `✅ ${rows.length} employees imported successfully` });

        } catch (dbError) {
            await connection.rollback();
            console.error(dbError);
            res.status(500).json({ error: dbError.message });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Excel processing failed' });
    } finally {
        if (connection) connection.release();
        if (req.file) fs.unlinkSync(req.file.path);
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`)); 