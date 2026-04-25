// ============================================================
//  MUMBAI LOCAL RAILWAY -- Express + MySQL Backend
//  4 Tables: employees | students | payments | passes
// ============================================================

const express = require('express');
const mysql2  = require('mysql2/promise');
const cors    = require('cors');
const path    = require('path');
const cfg     = require('./db.config');

const app  = express();
const PORT = 3000;

// ── Connection Pool ─────────────────────────────────────────
const pool = mysql2.createPool({
  host: cfg.host, user: cfg.user,
  password: cfg.password, database: cfg.database, port: cfg.port,
  waitForConnections: true, connectionLimit: 10,
});

pool.getConnection()
  .then(c => { console.log('✅ MySQL connected: railway_db'); c.release(); })
  .catch(e => console.error('❌ MySQL error:', e.message));

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ══════════════════════════════════════════════════════════════
//  TABLE 1: EMPLOYEES
// ══════════════════════════════════════════════════════════════
app.get('/api/employees', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM employees ORDER BY id ASC');
    res.json({ success: true, data: rows });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/api/employees', async (req, res) => {
  const { emp_id, name, designation, registered_on } = req.body;
  if (!emp_id || !name || !designation)
    return res.status(400).json({ success: false, error: 'Missing fields.' });
  try {
    await pool.query(
      'INSERT INTO employees (emp_id,name,designation,registered_on) VALUES (?,?,?,?)',
      [emp_id, name, designation, registered_on || new Date().toLocaleDateString('en-IN')]
    );
    res.json({ success: true, message: 'Employee registered.' });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ success: false, error: 'Employee ID already exists.' });
    res.status(500).json({ success: false, error: e.message });
  }
});

app.delete('/api/employees/:emp_id', async (req, res) => {
  try {
    await pool.query('DELETE FROM employees WHERE emp_id=?', [req.params.emp_id]);
    res.json({ success: true, message: 'Employee deleted.' });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ══════════════════════════════════════════════════════════════
//  TABLE 2: STUDENTS
// ══════════════════════════════════════════════════════════════
app.get('/api/students', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM students ORDER BY id ASC');
    res.json({ success: true, data: rows });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.get('/api/students/:stu_id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM students WHERE stu_id=?', [req.params.stu_id]);
    if (!rows.length) return res.status(404).json({ success: false, error: 'Not found.' });
    res.json({ success: true, data: rows[0] });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/api/students', async (req, res) => {
  const { stu_id, name, age, gender, college, contact } = req.body;
  if (!stu_id || !name)
    return res.status(400).json({ success: false, error: 'Missing fields.' });
  try {
    await pool.query(
      `INSERT INTO students (stu_id,name,age,gender,college,contact,registered_on)
       VALUES (?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE name=VALUES(name),age=VALUES(age),
         gender=VALUES(gender),college=VALUES(college),contact=VALUES(contact)`,
      [stu_id, name, age, gender, college, contact, new Date().toLocaleDateString('en-IN')]
    );
    res.json({ success: true, message: 'Student saved.' });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ══════════════════════════════════════════════════════════════
//  TABLE 3: PAYMENTS
// ══════════════════════════════════════════════════════════════
app.get('/api/payments', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM payments ORDER BY id DESC');
    res.json({ success: true, data: rows });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/api/payments', async (req, res) => {
  const { pay_id, amount, pay_mode, pay_status } = req.body;
  if (!pay_id)
    return res.status(400).json({ success: false, error: 'Missing pay_id.' });
  try {
    await pool.query(
      'INSERT INTO payments (pay_id,amount,pay_mode,pay_status,created_on) VALUES (?,?,?,?,?)',
      [pay_id, amount, pay_mode, pay_status, new Date().toLocaleString('en-IN')]
    );
    res.json({ success: true, message: 'Payment saved.' });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ══════════════════════════════════════════════════════════════
//  TABLE 4: PASSES (final record — joins all 3 tables)
// ══════════════════════════════════════════════════════════════
app.get('/api/passes', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT  p.*,
              s.name       AS stu_name,  s.age      AS stu_age,
              s.gender     AS stu_gender,s.college  AS stu_college,
              s.contact    AS stu_contact,
              py.amount    AS pay_amount, py.pay_mode, py.pay_status,
              e.name       AS emp_name
      FROM    passes  p
      LEFT JOIN students  s  ON p.stu_id   = s.stu_id
      LEFT JOIN payments  py ON p.pay_id   = py.pay_id
      LEFT JOIN employees e  ON p.issued_by = e.emp_id
      ORDER BY p.id DESC
    `);
    res.json({ success: true, data: rows });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.get('/api/passes/:pass_id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT  p.*,
              s.name       AS stu_name,  s.age      AS stu_age,
              s.gender     AS stu_gender,s.college  AS stu_college,
              s.contact    AS stu_contact,
              py.amount    AS pay_amount, py.pay_mode, py.pay_status,
              e.name       AS emp_name
      FROM    passes  p
      LEFT JOIN students  s  ON p.stu_id   = s.stu_id
      LEFT JOIN payments  py ON p.pay_id   = py.pay_id
      LEFT JOIN employees e  ON p.issued_by = e.emp_id
      WHERE   p.pass_id = ?
    `, [req.params.pass_id]);
    if (!rows.length) return res.status(404).json({ success: false, error: 'Pass not found.' });
    res.json({ success: true, data: rows[0] });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/api/passes', async (req, res) => {
  const p = req.body;
  if (!p.pass_id || !p.stu_id || !p.pay_id)
    return res.status(400).json({ success: false, error: 'Missing fields.' });
  try {
    await pool.query(
      `INSERT INTO passes
        (pass_id,issue_date,stu_id,issued_by,ticket_id,coach,rail_line,
         source,destination,duration,discount,pay_id)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [p.pass_id, p.issue_date, p.stu_id, p.issued_by, p.ticket_id,
       p.coach, p.rail_line, p.source, p.destination,
       p.duration, p.discount, p.pay_id]
    );
    res.json({ success: true, message: 'Pass saved.', pass_id: p.pass_id });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ── STATS ───────────────────────────────────────────────────
app.get('/api/stats', async (req, res) => {
  try {
    const [[e]]  = await pool.query('SELECT COUNT(*) AS cnt FROM employees');
    const [[s]]  = await pool.query('SELECT COUNT(*) AS cnt FROM students');
    const [[py]] = await pool.query('SELECT COUNT(*) AS cnt FROM payments');
    const [[ps]] = await pool.query('SELECT COUNT(*) AS cnt FROM passes');
    const [[r]]  = await pool.query(
      "SELECT IFNULL(SUM(CAST(REPLACE(amount,'Rs.','') AS DECIMAL(10,2))),0) AS total FROM payments WHERE pay_status='Paid'"
    );
    res.json({ success: true, data: {
      employees: e.cnt, students: s.cnt,
      payments: py.cnt, passes: ps.cnt, revenue: r.total
    }});
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚉 Mumbai Local Railway Server → http://localhost:${PORT}`);
  console.log(`   Tables: employees | students | payments | passes\n`);
});
