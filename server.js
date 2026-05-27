const express = require('express');
const cors    = require('cors');
const fetch   = require('node-fetch');

const app  = express();
const PORT = process.env.PORT || 3000;
const TC   = 'https://www.transparentclassroom.com/api/v1';

// ── Allow requests from your FinalSite domain ──────────────────────────────
// Replace 'https://www.yourdomain.com' with your actual school website URL.
// You can add multiple origins in the array if needed.
const ALLOWED_ORIGINS = '*';

app.use(cors());

app.use(express.json());

// ── Health check ───────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'MAC TC Proxy is running' });
});

// ── POST /auth  →  authenticate with TC and return api_token ──────────────
// Body: { email, password }
app.post('/auth', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }
  try {
    const tcRes = await fetch(`${TC}/authenticate.json`, {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${email}:${password}`).toString('base64'),
        'Content-Type': 'application/json',
      }
    });
    if (!tcRes.ok) {
      return res.status(tcRes.status).json({ error: 'TC authentication failed. Check your credentials.' });
    }
    const data = await tcRes.json();
    // Only return what the frontend needs — don't expose the raw password
    res.json({
      api_token:  data.api_token,
      school_id:  data.school_id,
      first_name: data.first_name,
      last_name:  data.last_name,
      email:      data.email,
    });
  } catch (err) {
    res.status(500).json({ error: 'Proxy error: ' + err.message });
  }
});

// ── GET /children  →  list children for the authenticated user ─────────────
// Headers: x-tc-token, x-tc-school-id
app.get('/children', async (req, res) => {
  const { 'x-tc-token': token, 'x-tc-school-id': schoolId } = req.headers;
  if (!token) return res.status(401).json({ error: 'Missing x-tc-token header' });
  try {
    const tcRes = await fetch(`${TC}/children.json?only_current=true`, {
      headers: tcHeaders(token, schoolId)
    });
    res.status(tcRes.status).json(await tcRes.json());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /activity  →  activity feed for a child ───────────────────────────
// Headers: x-tc-token, x-tc-school-id
// Query:   child_id, date_start (optional), date_end (optional)
app.get('/activity', async (req, res) => {
  const { 'x-tc-token': token, 'x-tc-school-id': schoolId } = req.headers;
  if (!token) return res.status(401).json({ error: 'Missing x-tc-token header' });
  const { child_id, date_start, date_end } = req.query;
  if (!child_id) return res.status(400).json({ error: 'child_id query param required' });
  const params = new URLSearchParams({ child_id });
  if (date_start) params.set('date_start', date_start);
  if (date_end)   params.set('date_end',   date_end);
  try {
    const tcRes = await fetch(`${TC}/activity.json?${params}`, {
      headers: tcHeaders(token, schoolId)
    });
    res.status(tcRes.status).json(await tcRes.json());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /classrooms  →  list classrooms ───────────────────────────────────
app.get('/classrooms', async (req, res) => {
  const { 'x-tc-token': token, 'x-tc-school-id': schoolId } = req.headers;
  if (!token) return res.status(401).json({ error: 'Missing x-tc-token header' });
  try {
    const tcRes = await fetch(`${TC}/classrooms.json`, {
      headers: tcHeaders(token, schoolId)
    });
    res.status(tcRes.status).json(await tcRes.json());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Helpers ────────────────────────────────────────────────────────────────
function tcHeaders(token, schoolId) {
  const h = {
    'X-TransparentClassroomToken': token,
    'Content-Type': 'application/json',
  };
  if (schoolId) h['X-TransparentClassroomSchoolId'] = schoolId;
  return h;
}

app.listen(PORT, () => console.log(`TC Proxy listening on port ${PORT}`));
