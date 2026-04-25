// ============================================================
//  MUMBAI LOCAL RAILWAY — Frontend App (API-connected)
// ============================================================

const API = 'http://localhost:3000/api';

// ──────────────────────────────────────────────────────────
//  MUMBAI LOCAL STATION DATA
// ──────────────────────────────────────────────────────────
const MUMBAI_STATIONS = {
  Western: [
    'Churchgate','Marine Lines','Charni Road','Grant Road','Mumbai Central',
    'Mahalaxmi','Lower Parel','Elphinstone Road','Dadar','Matunga Road',
    'Mahim','Bandra','Khar Road','Santacruz','Vile Parle','Andheri',
    'Jogeshwari','Ram Mandir','Goregaon','Malad','Kandivali','Borivali',
    'Dahisar','Mira Road','Bhayandar','Naigaon','Vasai Road','Nallasopara','Virar'
  ],
  Central: [
    'CSMT (Chhatrapati Shivaji Maharaj Terminus)','Masjid','Sandhurst Road',
    'Byculla','Chinchpokli','Currey Road','Parel','Dadar','Matunga',
    'Sion','Kurla','Vidyavihar','Ghatkopar','Vikhroli','Kanjurmarg',
    'Bhandup','Nahur','Mulund','Thane','Kalwa','Mumbra','Diva',
    'Kopar','Dombivli','Thakurli','Kalyan','Shahad','Ambivali','Titwala','Kasara'
  ],
  Harbour: [
    'CSMT (Chhatrapati Shivaji Maharaj Terminus)','Masjid','Dockyard Road',
    'Reay Road','Cotton Green','Sewri','Vadala Road','GTB Nagar',
    'Chunabhatti','Kurla','Tilaknagar','Chembur','Govandi','Mankhurd',
    'Vashi','Sanpada','Juinagar','Nerul','Seawood Darave','Belapur CBD',
    'Kharghar','Mansarovar','Khandeshwar','Panvel'
  ],
  'Trans-Harbour': [
    'Thane','Airoli','Rabale','Ghansoli','Kopar Khairane','Turbhe',
    'Juinagar','Sanpada','Vashi','Mankhurd'
  ]
};

// ──────────────────────────────────────────────────────────
//  DISCOUNT RULES — Mumbai Local
// ──────────────────────────────────────────────────────────
const discountMap = {
  'Second Class (GEN)':  '75%',
  'First Class (FC)':    '50%',
  'Ladies Second Class': '75%',
  'Ladies First Class':  '50%',
  'Divyaang Coach':      '100%',
};

const durationLabel = {
  '30':  'Monthly (30 days)',
  '90':  'Quarterly (90 days)',
  '365': 'Yearly (365 days)',
};

// ──────────────────────────────────────────────────────────
//  API HELPERS
// ──────────────────────────────────────────────────────────
async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  return res.json();
}

// ──────────────────────────────────────────────────────────
//  DB STATUS INDICATOR
// ──────────────────────────────────────────────────────────
async function checkDbStatus() {
  const ind = document.getElementById('db-status');
  try {
    const r = await fetch(`${API}/stats`);
    if (r.ok) {
      ind.textContent = '● Connected to Database';
      ind.className = 'db-status db-ok';
    } else throw new Error();
  } catch {
    ind.textContent = '● Database Offline';
    ind.className = 'db-status db-err';
  }
}

// ──────────────────────────────────────────────────────────
//  NAVIGATION
// ──────────────────────────────────────────────────────────
function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.section === id);
  });
  if (id === 'home') loadStats();
  if (id === 'employee') loadEmployees();
  if (id === 'records') loadRecords();
  if (id === 'concession') loadEmployeeDropdown();
}

// ──────────────────────────────────────────────────────────
//  TABS
// ──────────────────────────────────────────────────────────
function switchTab(tabId, btn) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  btn.classList.add('active');
  if (tabId === 'ticket-tab' && !document.getElementById('ticket-id').value)
    document.getElementById('ticket-id').value = generateId('MSL');
  if (tabId === 'payment-tab' && !document.getElementById('pay-id').value)
    document.getElementById('pay-id').value = generateId('PAY');
}

// ──────────────────────────────────────────────────────────
//  ID GENERATORS
// ──────────────────────────────────────────────────────────
function generateId(prefix) {
  const ts  = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${ts}-${rnd}`;
}
function generatePassId() {
  return `MSLPASS-${Date.now().toString(36).toUpperCase()}`;
}

// ──────────────────────────────────────────────────────────
//  VALIDATION HELPERS
// ──────────────────────────────────────────────────────────
// Rules:
//   Emp ID    : alphanumeric + hyphens, 3-20 chars  e.g. EMP-001
//   Student ID: alphanumeric + hyphens, 3-20 chars  e.g. STU-001
//   Contact   : exactly 10 digits, starts with 6-9
const RULES = {
  empId:   { re: /^EMP-[A-Za-z0-9]{5}$/, msg: 'Emp ID must be in format EMP-XXXXX (e.g. EMP-00123)' },
  stuId:   { re: /^STU-[A-Za-z0-9]{5}$/, msg: 'Student ID must be in format STU-XXXXX (e.g. STU-00123)' },
  contact: { re: /^[6-9]\d{9}$/,          msg: 'Contact must be a valid 10-digit Indian mobile number (starts with 6–9).' },
};

function setError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.style.borderColor = message ? '#ef4444' : '';
  let err = field.parentNode.querySelector('.field-error');
  if (!err) {
    err = document.createElement('p');
    err.className = 'field-error';
    err.style.cssText = 'color:#ef4444;font-size:0.72rem;margin:3px 0 0 2px;';
    field.parentNode.insertBefore(err, field.nextSibling);
  }
  err.textContent = message || '';
  err.style.display = message ? 'block' : 'none';
}

function clearError(fieldId) { setError(fieldId, ''); }

function validateField(fieldId, ruleKey) {
  const v = val(fieldId);
  if (!v) { setError(fieldId, 'This field is required.'); return false; }
  const rule = RULES[ruleKey];
  if (rule && !rule.re.test(v)) { setError(fieldId, rule.msg); return false; }
  clearError(fieldId);
  return true;
}

// ──────────────────────────────────────────────────────────
//  STATS (from DB)
// ──────────────────────────────────────────────────────────
async function loadStats() {
  try {
    const r = await apiFetch(`${API}/stats`);
    if (r.success) {
      document.getElementById('stat-emp').textContent  = r.data.employees;
      document.getElementById('stat-pass').textContent = r.data.passes;
      document.getElementById('stat-pay').textContent  = '₹' + Number(r.data.revenue || 0).toLocaleString('en-IN');
    }
  } catch { /* offline */ }
}

// ──────────────────────────────────────────────────────────
//  EMPLOYEE — REGISTER
// ──────────────────────────────────────────────────────────
async function registerEmployee() {
  // Validate all fields
  const v1 = validateField('emp-id',   'empId');
  const v2 = validateField('emp-name', null);
  const v3 = validateField('emp-designation', null);
  if (!v1 || !v2 || !v3) return;

  const emp_id      = val('emp-id');
  const name        = val('emp-name');
  const designation = val('emp-designation');

  const btn = document.querySelector('#employee .btn-primary');
  btn.disabled = true; btn.textContent = 'Saving…';

  try {
    const r = await apiFetch(`${API}/employees`, {
      method: 'POST',
      body: JSON.stringify({ emp_id, name, designation,
        registered_on: new Date().toLocaleDateString('en-IN') }),
    });
    if (r.success) {
      toast(`✅ ${name} registered successfully!`, 'success');
      clear('emp-id'); clear('emp-name'); setVal('emp-designation', '');
      loadEmployees();
      loadStats();
    } else {
      toast(r.error || 'Registration failed.', 'error');
    }
  } catch {
    toast('Cannot reach server. Is it running?', 'error');
  } finally {
    btn.disabled = false; btn.textContent = 'Register Staff Member';
  }
}

// ──────────────────────────────────────────────────────────
//  EMPLOYEE — LOAD LIST
// ──────────────────────────────────────────────────────────
async function loadEmployees() {
  try {
    const r = await apiFetch(`${API}/employees`);
    const sec   = document.getElementById('emp-list-section');
    const tbody = document.getElementById('emp-tbody');
    if (!r.success || !r.data.length) { sec.style.display = 'none'; return; }
    sec.style.display = 'block';
    tbody.innerHTML = r.data.map(e => `
      <tr>
        <td class="emp-id-cell">${e.emp_id}</td>
        <td>${e.name}</td>
        <td>${e.designation}</td>
        <td>${e.registered_on}</td>
        <td>
          <button class="btn-del" onclick="deleteEmployee('${e.emp_id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  } catch { /* offline */ }
}

async function deleteEmployee(emp_id) {
  if (!confirm(`Delete employee ${emp_id}?`)) return;
  try {
    await apiFetch(`${API}/employees/${emp_id}`, { method: 'DELETE' });
    toast('Employee removed.', 'success');
    loadEmployees();
    loadStats();
  } catch { toast('Error deleting employee.', 'error'); }
}

async function loadEmployeeDropdown() {
  try {
    const r   = await apiFetch(`${API}/employees`);
    const sel = document.getElementById('issued-by');
    const cur = sel.value;
    sel.innerHTML = '<option value="">Select Employee</option>' +
      (r.data || []).map(e =>
        `<option value="${e.emp_id}" ${e.emp_id === cur ? 'selected' : ''}>${e.emp_id} — ${e.name}</option>`
      ).join('');
  } catch { /* offline */ }
}

// ──────────────────────────────────────────────────────────
//  STATIONS
// ──────────────────────────────────────────────────────────
function populateStations() {
  const line     = document.getElementById('railway-line').value;
  const stations = MUMBAI_STATIONS[line] || [];
  const opts     = '<option value="">Select station</option>' +
    stations.map(s => `<option value="${s}">${s}</option>`).join('');
  document.getElementById('source').innerHTML      = opts;
  document.getElementById('destination').innerHTML = opts;
}

// ──────────────────────────────────────────────────────────
//  DISCOUNT & AMOUNT CALC
// ──────────────────────────────────────────────────────────
function updateDiscount() {
  const cls = document.getElementById('coach-class').value;
  document.getElementById('discount').value = discountMap[cls] || '';
  calcAmount();
}

function calcAmount() {
  const base    = parseFloat(document.getElementById('base-fare').value) || 0;
  const cls     = document.getElementById('coach-class').value;
  const dur     = parseFloat(document.getElementById('duration').value) || 1;
  const discStr = discountMap[cls] || '0%';
  const disc    = parseFloat(discStr) / 100;
  const amount  = (base * dur * (1 - disc)).toFixed(2);
  document.getElementById('pay-amount').value = base > 0 ? `₹${Number(amount).toLocaleString('en-IN')}` : '';
}

// ──────────────────────────────────────────────────────────
//  GENERATE PASS → Save to DB
// ──────────────────────────────────────────────────────────
async function generatePass() {
  const stuId      = val('stu-id');
  const stuName    = val('stu-name');
  const stuAge     = val('stu-age');
  const stuGender  = val('stu-gender');
  const stuCollege = val('stu-college');
  const stuContact = val('stu-contact');
  const issuedBy   = val('issued-by');
  const ticketId   = val('ticket-id') || generateId('MSL');
  const coach      = val('coach-class');
  const railLine   = val('railway-line');
  const source     = val('source');
  const dest       = val('destination');
  const duration   = val('duration');
  const discount   = val('discount');
  const payId      = val('pay-id') || generateId('PAY');
  const baseFare   = val('base-fare');
  const payAmount  = document.getElementById('pay-amount').value;
  const payMode    = val('pay-mode');
  const payStatus  = val('pay-status');

  // Validate
  // Validate student tab fields
  const sv1 = validateField('stu-id',      'stuId');
  const sv2 = validateField('stu-name',    null);
  const sv3 = validateField('stu-age',     null);
  const sv4 = validateField('stu-gender',  null);
  const sv5 = validateField('stu-college', null);
  const sv6 = validateField('stu-contact', 'contact');
  const sv7 = validateField('issued-by',   null);

  // Age must be >= 17
  const ageNum = parseInt(val('stu-age'), 10);
  if (sv3 && ageNum < 17) {
    setError('stu-age', 'Age should not be less than 17.');
    toast('⚠️ Age should not be less than 17.', 'error');
    switchTab('student-tab', document.querySelectorAll('.tab')[0]); return;
  }

  if (!sv1 || !sv2 || !sv3 || !sv4 || !sv5 || !sv6 || !sv7) {
    toast('Please fix the errors in Student Details.', 'error');
    switchTab('student-tab', document.querySelectorAll('.tab')[0]); return;
  }
  if (!coach || !railLine || !source || !dest || !duration) {
    toast('Please complete all Ticket Details.', 'error');
    switchTab('ticket-tab', document.querySelectorAll('.tab')[1]); return;
  }
  if (!baseFare || !payMode || !payStatus) {
    toast('Please complete all Payment Details.', 'error'); return;
  }

  const pass_id   = generatePassId();
  const issueDate = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  const btn = document.querySelector('#payment-tab .btn-primary');
  btn.disabled = true; btn.textContent = 'Saving to DB…';

  try {
    // ── Step 1: Save to students table ─────────────────────
    await apiFetch(`${API}/students`, {
      method: 'POST',
      body: JSON.stringify({
        stu_id: stuId, name: stuName, age: stuAge,
        gender: stuGender, college: stuCollege, contact: stuContact,
      }),
    });

    // ── Step 2: Save to payments table ─────────────────────
    const payR = await apiFetch(`${API}/payments`, {
      method: 'POST',
      body: JSON.stringify({
        pay_id: payId, amount: payAmount,
        pay_mode: payMode, pay_status: payStatus,
      }),
    });
    if (!payR.success) {
      toast(payR.error || 'Payment save failed.', 'error'); return;
    }

    // ── Step 3: Save to passes table (ticket + FK refs) ────
    const r = await apiFetch(`${API}/passes`, {
      method: 'POST',
      body: JSON.stringify({
        pass_id,    issue_date: issueDate,
        stu_id:     stuId,
        issued_by:  issuedBy,
        ticket_id:  ticketId,
        coach,      rail_line: railLine,
        source,     destination: dest,
        duration:   durationLabel[duration] || `${duration} days`,
        discount,
        pay_id:     payId,
      }),
    });

    if (r.success) {
      const record = {
        passId: pass_id, issueDate,
        student: { id: stuId, name: stuName, age: stuAge, gender: stuGender,
                   college: stuCollege, contact: stuContact },
        issuedBy,
        ticket: { id: ticketId, coach, line: railLine, source, destination: dest,
                  duration: durationLabel[duration] || `${duration} days`, discount },
        payment: { id: payId, amount: payAmount, mode: payMode, status: payStatus },
      };
      fillPassModal(record);
      document.getElementById('pass-modal').style.display = 'flex';

      // Show the post-generation print banner in the payment tab
      const banner = document.getElementById('post-gen-banner');
      const bannerPassId = document.getElementById('post-gen-id');
      if (banner) {
        bannerPassId.textContent = pass_id;
        banner.style.display = 'flex';
      }

      resetConcessionForm();
      toast(`🎟️ Pass saved — ${pass_id}`, 'success');
      loadStats();
    } else {
      toast(r.error || 'Failed to save pass.', 'error');
    }
  } catch {
    toast('Cannot reach server. Is it running?', 'error');
  } finally {
    btn.disabled = false; btn.textContent = '🎟️ Generate Pass';
  }
}

// ──────────────────────────────────────────────────────────
//  FILL PASS MODAL
// ──────────────────────────────────────────────────────────
function fillPassModal(r) {
  const lineEmoji = { Western: '🔵', Central: '🔴', Harbour: '🟢' };

  setText('p-stuid',   r.student?.id   || r.stu_id);
  setText('p-name',    r.student?.name || r.stu_name);
  setText('p-age',     (r.student?.age || r.stu_age) + ' yrs');
  setText('p-gender',  r.student?.gender  || r.stu_gender);
  setText('p-college', r.student?.college || r.stu_college);
  setText('p-contact', r.student?.contact || r.stu_contact);
  setText('p-issued',  r.issuedBy || r.issued_by);

  const line = r.ticket?.line || r.rail_line || '';
  setText('p-line', line ? `${lineEmoji[line] || ''} ${line} Line` : '—');

  setText('p-tickid', r.ticket?.id || r.ticket_id);
  setText('p-coach',  r.ticket?.coach || r.coach);
  setText('p-src',    r.ticket?.source || r.source);
  setText('p-dest',   r.ticket?.destination || r.destination);
  setText('p-dur',    r.ticket?.duration || r.duration);
  setText('p-disc',   r.ticket?.discount || r.discount);

  setText('p-payid',  r.payment?.id || r.pay_id);
  setText('p-amount', r.payment?.amount || r.amount);
  setText('p-mode',   r.payment?.mode || r.pay_mode);
  setText('p-status', r.payment?.status || r.pay_status);

  const status = r.payment?.status || r.pay_status || '';
  const badge  = document.getElementById('pass-badge');
  badge.textContent   = status.toUpperCase();
  badge.style.background = status === 'Paid' ? 'var(--green-lt)' :
                           status === 'Pending' ? 'var(--amber-lt)' : 'var(--red-lt)';
  badge.style.color      = status === 'Paid' ? 'var(--green)' :
                           status === 'Pending' ? 'var(--amber)' : 'var(--red)';

  setText('barcode-num', r.passId || r.pass_id);
  setText('p-date', 'Issued: ' + (r.issueDate || r.issue_date));
}

// ──────────────────────────────────────────────────────────
//  RECORDS — Load from DB
// ──────────────────────────────────────────────────────────
async function loadRecords() {
  const grid  = document.getElementById('records-grid');
  const empty = document.getElementById('no-records');
  grid.innerHTML = '<p style="padding:1rem;color:var(--muted);font-size:.82rem;">Loading records…</p>';
  empty.style.display = 'none';

  try {
    const r = await apiFetch(`${API}/passes`);
    if (!r.success || !r.data.length) {
      grid.innerHTML = '';
      empty.style.display = 'block';
      return;
    }
    grid.innerHTML = r.data.map(p => {
      const badgeClass = p.pay_status === 'Paid' ? 'badge-paid'
        : p.pay_status === 'Pending' ? 'badge-pending' : 'badge-failed';
      return `
        <div class="record-mini" onclick="viewPass('${p.pass_id}')">
          <div class="rm-header">
            <div>
              <div class="rm-name">${p.stu_name}</div>
              <div class="rm-tid">${p.ticket_id}</div>
            </div>
            <div class="rm-badge ${badgeClass}">${p.pay_status}</div>
          </div>
          <div class="rm-info">
            <div class="rm-kv"><span class="rm-k">Student ID</span><span class="rm-v">${p.stu_id}</span></div>
            <div class="rm-kv"><span class="rm-k">Coach</span><span class="rm-v">${p.coach}</span></div>
            <div class="rm-kv"><span class="rm-k">Amount</span><span class="rm-v">${p.amount}</span></div>
            <div class="rm-kv"><span class="rm-k">Issued On</span><span class="rm-v">${p.issue_date}</span></div>
            <div class="rm-route">
              <span class="rm-station">${p.source}</span>
              <span class="rm-arrow">→</span>
              <span class="rm-station">${p.destination}</span>
            </div>
          </div>
        </div>`;
    }).join('');
  } catch {
    grid.innerHTML = '<p style="padding:1rem;color:var(--red);font-size:.82rem;">⚠️ Cannot connect to database server.</p>';
  }
}

async function viewPass(pass_id) {
  try {
    const r = await apiFetch(`${API}/passes/${pass_id}`);
    if (r.success) {
      fillPassModal(r.data);
      document.getElementById('pass-modal').style.display = 'flex';
    }
  } catch { toast('Error loading pass.', 'error'); }
}

// ──────────────────────────────────────────────────────────
//  MODAL CLOSE
// ──────────────────────────────────────────────────────────
function closeModal(e) {
  if (e.target === document.getElementById('pass-modal'))
    document.getElementById('pass-modal').style.display = 'none';
}

// ──────────────────────────────────────────────────────────
//  PRINT PASS
// ──────────────────────────────────────────────────────────
function printPass() {
  // Ensure the modal is visible before printing
  const modal = document.getElementById('pass-modal');
  modal.style.display = 'flex';
  setTimeout(() => window.print(), 150);
}

async function generateAndPrint() {
  // Generate the pass first, then auto-trigger print
  const modal = document.getElementById('pass-modal');
  const wasHidden = modal.style.display !== 'flex';

  await generatePass();

  // If successfully generated, the modal will now be visible — print it
  if (modal.style.display === 'flex') {
    setTimeout(() => window.print(), 300);
  }
}

// ──────────────────────────────────────────────────────────
//  RESET FORM
// ──────────────────────────────────────────────────────────
function resetConcessionForm() {
  ['stu-id','stu-name','stu-age','stu-college','stu-contact',
   'ticket-id','discount','pay-id','base-fare','pay-amount']
    .forEach(id => clear(id));
  ['stu-gender','coach-class','railway-line','issued-by','pay-mode','pay-status','duration']
    .forEach(id => setVal(id, ''));
  document.getElementById('source').innerHTML      = '<option value="">Select source station</option>';
  document.getElementById('destination').innerHTML = '<option value="">Select destination station</option>';
  // Hide the post-gen banner for next session
  const banner = document.getElementById('post-gen-banner');
  if (banner) banner.style.display = 'none';
  switchTab('student-tab', document.querySelectorAll('.tab')[0]);
}

// ──────────────────────────────────────────────────────────
//  UTILITIES
// ──────────────────────────────────────────────────────────
function val(id)        { return document.getElementById(id)?.value?.trim() || ''; }
function clear(id)      { const el = document.getElementById(id); if (el) el.value = ''; }
function setVal(id, v)  { const el = document.getElementById(id); if (el) el.value = v; }
function setText(id, v) { const el = document.getElementById(id); if (el) el.textContent = v || '—'; }

function toast(msg, type = 'info') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast show ${type}`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = 'toast'; }, 3500);
}

// ──────────────────────────────────────────────────────────
//  INIT
// ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Auto-generate IDs
  document.getElementById('ticket-id').value = generateId('MSL');
  document.getElementById('pay-id').value    = generateId('PAY');

  // Load home stats
  await loadStats();

  // ── Real-time validation on blur ──────────────────────────
  const blurRules = [
    ['emp-id',      'empId'],
    ['stu-id',      'stuId'],
    ['stu-contact', 'contact'],
    ['emp-name',    null],
    ['emp-designation', null],
    ['stu-name',    null],
    ['stu-age',     null],
    ['stu-gender',  null],
    ['stu-college', null],
    ['issued-by',   null],
  ];
  blurRules.forEach(([id, rule]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur',  () => validateField(id, rule));
    el.addEventListener('input', () => { if (el.style.borderColor === 'rgb(239, 68, 68)') validateField(id, rule); });
  });

  // Real-time age validation — must be >= 17
  const ageEl = document.getElementById('stu-age');
  if (ageEl) {
    const checkAge = () => {
      const v = parseInt(ageEl.value, 10);
      if (ageEl.value && v < 17) {
        setError('stu-age', 'Age should not be less than 17.');
      } else {
        clearError('stu-age');
      }
    };
    ageEl.addEventListener('blur',  checkAge);
    ageEl.addEventListener('input', checkAge);
  }

  // Escape closes modal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape')
      document.getElementById('pass-modal').style.display = 'none';
  });
});
