// ============================================================
//  MIGRATION SCRIPT — Extract students into their own table
//  Run once: node migrate_db.js
// ============================================================

const path     = require('path');
const fs       = require('fs');

const DB_FILE = path.join(__dirname, 'railway_db.json');
const raw     = fs.readFileSync(DB_FILE, 'utf8');
const db      = JSON.parse(raw);

// Backup original
fs.writeFileSync(DB_FILE + '.backup', raw);
console.log('✅ Backup saved → railway_db.json.backup');

// Extract students from passes (deduplicate by stu_id)
const studentsMap = {};
db.passes.forEach(p => {
  if (!studentsMap[p.stu_id]) {
    studentsMap[p.stu_id] = {
      stu_id:       p.stu_id,
      name:         p.stu_name,
      age:          p.stu_age,
      gender:       p.stu_gender,
      college:      p.stu_college,
      contact:      p.stu_contact,
      registered_on: p.issue_date ? p.issue_date.split(',')[0] : new Date().toLocaleDateString('en-IN')
    };
  }
});

// Strip student fields from passes (keep only stu_id as reference)
const cleanPasses = db.passes.map(p => ({
  pass_id:     p.pass_id,
  issue_date:  p.issue_date,
  stu_id:      p.stu_id,       // foreign key → students table
  issued_by:   p.issued_by,
  ticket_id:   p.ticket_id,
  coach:       p.coach,
  rail_line:   p.rail_line,
  source:      p.source,
  destination: p.destination,
  duration:    p.duration,
  discount:    p.discount,
  pay_id:      p.pay_id,
  amount:      p.amount,
  pay_mode:    p.pay_mode,
  pay_status:  p.pay_status,
}));

const newDb = {
  employees: db.employees || [],
  students:  Object.values(studentsMap),
  passes:    cleanPasses,
};

fs.writeFileSync(DB_FILE, JSON.stringify(newDb, null, 2));
console.log(`✅ Migration complete!`);
console.log(`   → ${newDb.employees.length} employees`);
console.log(`   → ${newDb.students.length} students`);
console.log(`   → ${newDb.passes.length} passes`);
console.log(`\nNew structure saved to railway_db.json`);
