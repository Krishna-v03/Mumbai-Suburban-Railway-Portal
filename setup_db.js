// ============================================================
//  AUTO SETUP -- 4 Normalized Tables in MySQL
//  employees | students | payments | passes
// ============================================================

const mysql2 = require('mysql2/promise');
const cfg    = require('./db.config');

async function setup() {
  console.log('\n====================================================');
  console.log('  MUMBAI LOCAL RAILWAY -- MySQL Setup (4 Tables)');
  console.log('====================================================\n');

  const conn = await mysql2.createConnection({
    host: cfg.host, user: cfg.user,
    password: cfg.password, port: cfg.port,
  });

  console.log('Connected: ' + cfg.user + '@' + cfg.host);

  await conn.query('CREATE DATABASE IF NOT EXISTS railway_db');
  await conn.query('USE railway_db');
  console.log('Database "railway_db" ready.\n');

  // Drop in reverse FK order
  await conn.query('SET FOREIGN_KEY_CHECKS = 0');
  await conn.query('DROP TABLE IF EXISTS passes');
  await conn.query('DROP TABLE IF EXISTS payments');
  await conn.query('DROP TABLE IF EXISTS students');
  await conn.query('DROP TABLE IF EXISTS employees');
  await conn.query('SET FOREIGN_KEY_CHECKS = 1');
  console.log('Old tables cleared.');

  // ── Table 1: employees ────────────────────────────────────
  await conn.query(`
    CREATE TABLE employees (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      emp_id        VARCHAR(50)  NOT NULL UNIQUE,
      name          VARCHAR(100) NOT NULL,
      designation   VARCHAR(100) NOT NULL,
      registered_on VARCHAR(50)  NOT NULL
    )
  `);
  console.log('Table "employees" created.');

  // ── Table 2: students ─────────────────────────────────────
  await conn.query(`
    CREATE TABLE students (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      stu_id        VARCHAR(50)  NOT NULL UNIQUE,
      name          VARCHAR(100) NOT NULL,
      age           VARCHAR(10),
      gender        VARCHAR(20),
      college       VARCHAR(200),
      contact       VARCHAR(20),
      registered_on VARCHAR(50)
    )
  `);
  console.log('Table "students" created.');

  // ── Table 3: payments ─────────────────────────────────────
  await conn.query(`
    CREATE TABLE payments (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      pay_id     VARCHAR(100) NOT NULL UNIQUE,
      amount     VARCHAR(50),
      pay_mode   VARCHAR(50),
      pay_status VARCHAR(50),
      created_on VARCHAR(100)
    )
  `);
  console.log('Table "payments" created.');

  // ── Table 4: passes (final record) ────────────────────────
  await conn.query(`
    CREATE TABLE passes (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      pass_id     VARCHAR(100) NOT NULL UNIQUE,
      issue_date  VARCHAR(100) NOT NULL,
      stu_id      VARCHAR(50)  NOT NULL,
      issued_by   VARCHAR(50)  NOT NULL,
      ticket_id   VARCHAR(100),
      coach       VARCHAR(100),
      rail_line   VARCHAR(50),
      source      VARCHAR(100),
      destination VARCHAR(100),
      duration    VARCHAR(50),
      discount    VARCHAR(20),
      pay_id      VARCHAR(100),
      FOREIGN KEY (stu_id)   REFERENCES students(stu_id),
      FOREIGN KEY (pay_id)   REFERENCES payments(pay_id)
    )
  `);
  console.log('Table "passes" created.');

  // Show final structure
  const [tables] = await conn.query('SHOW TABLES');
  console.log('\n--- Tables in railway_db ---');
  tables.forEach(t => console.log('  * ' + Object.values(t)[0]));

  await conn.end();
  console.log('\n====================================================');
  console.log('  Done! Now run: node server.js');
  console.log('====================================================\n');
}

setup().catch(err => {
  console.error('\nSetup failed:', err.message);
  if (err.message.includes('Access denied'))
    console.error('Check your password in db.config.js\n');
});
