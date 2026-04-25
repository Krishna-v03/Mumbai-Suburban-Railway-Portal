// ============================================================
//  MUMBAI LOCAL RAILWAY -- MySQL Database Viewer (4 Tables)
//
//  USAGE:
//    node view_db.js              -- all 4 tables
//    node view_db.js employees    -- employees table
//    node view_db.js students     -- students table
//    node view_db.js payments     -- payments table
//    node view_db.js passes       -- passes (final record)
//    node view_db.js stats        -- summary counts
// ============================================================

const mysql2 = require('mysql2/promise');
const cfg    = require('./db.config');

const section = (process.argv[2] || 'all').toLowerCase();

// ANSI colours
const R  = '\x1b[0m';
const BD = '\x1b[1m';
const DM = '\x1b[2m';
const CY = '\x1b[36m';
const YL = '\x1b[33m';
const GR = '\x1b[32m';
const RD = '\x1b[31m';
const BL = '\x1b[34m';
const WT = '\x1b[37m';
const MG = '\x1b[35m';

const c   = (v, ...codes) => codes.join('') + String(v == null ? '' : v) + R;
const hr  = (ch='-', n=84) => c(ch.repeat(n), DM);
const pad = (v, n) => {
  let s = String(v == null ? '' : v);
  if (s.length > n) s = s.slice(0, n-2) + '..';
  return s.padEnd(n);
};

function banner() {
  console.log('\n' + hr('='));
  console.log(c('  MUMBAI LOCAL RAILWAY -- MySQL Database: railway_db', BD, CY));
  console.log(c('  Tables: employees | students | payments | passes', DM));
  console.log(hr('='));
}

async function showStats(conn) {
  const [[e]]  = await conn.query('SELECT COUNT(*) c FROM employees');
  const [[s]]  = await conn.query('SELECT COUNT(*) c FROM students');
  const [[py]] = await conn.query('SELECT COUNT(*) c FROM payments');
  const [[ps]] = await conn.query('SELECT COUNT(*) c FROM passes');
  const [[pd]] = await conn.query("SELECT COUNT(*) c FROM payments WHERE pay_status='Paid'");
  const [[pe]] = await conn.query("SELECT COUNT(*) c FROM payments WHERE pay_status='Pending'");
  const [[pf]] = await conn.query("SELECT COUNT(*) c FROM payments WHERE pay_status='Failed'");

  console.log('\n' + c('  [SUMMARY]', BD, YL));
  console.log(hr());
  console.log(c('  Employees   : ', DM) + c(e.c,  CY, BD));
  console.log(c('  Students    : ', DM) + c(s.c,  CY, BD));
  console.log(c('  Payments    : ', DM) + c(py.c, CY, BD) +
    '   ' + c('Paid: '+pd.c, GR) + '   ' + c('Pending: '+pe.c, YL) + '   ' + c('Failed: '+pf.c, RD));
  console.log(c('  Passes      : ', DM) + c(ps.c, CY, BD));
  console.log(hr() + '\n');
}

async function showEmployees(conn) {
  const [rows] = await conn.query('SELECT * FROM employees ORDER BY id');
  console.log('\n' + c('  [TABLE: employees]', BD, YL));
  console.log(hr());
  if (!rows.length) { console.log(c('  No records.\n', DM)); return; }
  console.log('  ' + [pad('#',3), pad('EMP ID',14), pad('NAME',22), pad('DESIGNATION',28), pad('DATE',14)].map(h=>c(h,BD)).join('  '));
  console.log(hr());
  rows.forEach((r,i) => console.log('  ' + [
    c(pad(i+1,3),DM), c(pad(r.emp_id,14),CY), c(pad(r.name,22),WT),
    c(pad(r.designation,28),DM), c(pad(r.registered_on,14),DM),
  ].join('  ')));
  console.log(hr());
  console.log(c('  Total: '+rows.length+' employee(s)\n', GR));
}

async function showStudents(conn) {
  const [rows] = await conn.query('SELECT * FROM students ORDER BY id');
  console.log('\n' + c('  [TABLE: students]', BD, YL));
  console.log(hr());
  if (!rows.length) { console.log(c('  No records.\n', DM)); return; }
  console.log('  ' + [pad('#',3), pad('STU ID',14), pad('NAME',20), pad('AGE',5), pad('GENDER',9), pad('COLLEGE',26), pad('CONTACT',13)].map(h=>c(h,BD)).join('  '));
  console.log(hr());
  rows.forEach((r,i) => console.log('  ' + [
    c(pad(i+1,3),DM), c(pad(r.stu_id,14),CY), c(pad(r.name,20),WT),
    c(pad(r.age,5),DM), c(pad(r.gender,9),DM), c(pad(r.college,26),DM), c(pad(r.contact,13),DM),
  ].join('  ')));
  console.log(hr());
  console.log(c('  Total: '+rows.length+' student(s)\n', GR));
}

async function showPayments(conn) {
  const [rows] = await conn.query('SELECT * FROM payments ORDER BY id DESC');
  console.log('\n' + c('  [TABLE: payments]', BD, MG));
  console.log(hr());
  if (!rows.length) { console.log(c('  No records.\n', DM)); return; }
  console.log('  ' + [pad('#',3), pad('PAY ID',24), pad('AMOUNT',12), pad('MODE',14), pad('STATUS',10), pad('CREATED ON',22)].map(h=>c(h,BD)).join('  '));
  console.log(hr());
  rows.forEach((r,i) => {
    const sc = r.pay_status==='Paid'?GR : r.pay_status==='Pending'?YL : RD;
    console.log('  ' + [
      c(pad(i+1,3),DM), c(pad(r.pay_id,24),MG), c(pad(r.amount,12),GR,BD),
      c(pad(r.pay_mode,14),DM), c(pad(r.pay_status,10),sc,BD), c(pad(r.created_on,22),DM),
    ].join('  '));
  });
  console.log(hr());
  console.log(c('  Total: '+rows.length+' payment(s)\n', GR));
}

async function showPasses(conn) {
  const [rows] = await conn.query(`
    SELECT p.*, s.name stu_name, s.age stu_age, s.gender stu_gender,
           s.college stu_college, s.contact stu_contact,
           py.amount pay_amount, py.pay_mode, py.pay_status, e.name emp_name
    FROM passes p
    LEFT JOIN students  s  ON p.stu_id   = s.stu_id
    LEFT JOIN payments  py ON p.pay_id   = py.pay_id
    LEFT JOIN employees e  ON p.issued_by = e.emp_id
    ORDER BY p.id DESC
  `);
  console.log('\n' + c('  [TABLE: passes  -- Final Record]', BD, YL));
  console.log(hr());
  if (!rows.length) { console.log(c('  No records.\n', DM)); return; }
  rows.forEach((p,i) => {
    const sc   = p.pay_status==='Paid'?GR : p.pay_status==='Pending'?YL : RD;
    const mark = p.pay_status==='Paid'?'[PAID]' : p.pay_status==='Pending'?'[PENDING]':'[FAILED]';
    console.log(c('  ['+(i+1)+'] ',DM) + c(p.pass_id,CY,BD) + '  ' + c(mark,sc,BD));
    console.log(c('       Issued On  : ',DM) + p.issue_date);
    console.log(c('       Student    : ',DM) + c(p.stu_name||'?',WT,BD) + c(' ('+p.stu_id+')',DM) +
      '   Age: '+(p.stu_age||'?')+'   Gender: '+(p.stu_gender||'?'));
    console.log(c('       College    : ',DM) + (p.stu_college||'?'));
    console.log(c('       Contact    : ',DM) + (p.stu_contact||'?') + c('   Issued By: ',DM) +
      p.issued_by + (p.emp_name ? c(' ('+p.emp_name+')',DM) : ''));
    console.log(c('       Route      : ',DM) + c(p.source,BL,BD) + c(' --> ',DM) + c(p.destination,BL,BD) +
      c('  ('+p.rail_line+' Line)',DM));
    console.log(c('       Ticket     : ',DM) + p.ticket_id +
      '   Coach: '+p.coach+'   Duration: '+p.duration+'   Discount: '+c(p.discount,YL));
    console.log(c('       Payment    : ',DM) + p.pay_id +
      '   Amount: '+c(p.pay_amount,GR,BD)+'   Mode: '+p.pay_mode);
    if (i < rows.length-1) console.log(hr('.'));
  });
  console.log(hr());
  console.log(c('  Total: '+rows.length+' pass(es)\n', GR));
}

// ── MAIN ────────────────────────────────────────────────────
(async () => {
  let conn;
  try {
    conn = await mysql2.createConnection(cfg);
    banner();
    if      (section==='employees'||section==='emp')  await showEmployees(conn);
    else if (section==='students' ||section==='stu')  await showStudents(conn);
    else if (section==='payments' ||section==='pay')  await showPayments(conn);
    else if (section==='passes'   ||section==='pass') await showPasses(conn);
    else if (section==='stats')                       await showStats(conn);
    else {
      await showStats(conn);
      await showEmployees(conn);
      await showStudents(conn);
      await showPayments(conn);
      await showPasses(conn);
    }
  } catch (err) {
    console.error('\n  ERROR:', err.message);
    if (err.message.includes('Access denied'))
      console.error('  Fix: Open db.config.js and check your password.\n');
  } finally {
    if (conn) await conn.end();
  }
})();
