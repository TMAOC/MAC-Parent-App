const express = require('express');
const fetch   = require('node-fetch');

const app  = express();
const PORT = process.env.PORT || 3000;
const TC   = 'https://www.transparentclassroom.com/api/v1';

app.use(express.json());

// Allow ALL origins
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,x-tc-token,x-tc-school-id');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.get('/', (req, res) => {
  res.json({ status: 'MAC TC Proxy is running' });
});

app.post('/auth', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  try {
    const tcRes = await fetch(`${TC}/authenticate.json`, {
      headers: { 'Authorization': 'Basic ' + Buffer.from(`${email}:${password}`).toString('base64') }
    });
    if (!tcRes.ok) return res.status(tcRes.status).json({ error: 'TC authentication failed' });
    const data = await tcRes.json();
    res.json({ api_token: data.api_token, school_id: data.school_id, first_name: data.first_name, last_name: data.last_name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/children', async (req, res) => {
  const token = req.headers['x-tc-token'];
  const schoolId = req.headers['x-tc-school-id'];
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const tcRes = await fetch(`${TC}/children.json?only_current=true`, {
      headers: { 'X-TransparentClassroomToken': token, 'X-TransparentClassroomSchoolId': schoolId }
    });
    res.status(tcRes.status).json(await tcRes.json());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/activity', async (req, res) => {
  const token = req.headers['x-tc-token'];
  const schoolId = req.headers['x-tc-school-id'];
  if (!token) return res.status(401).json({ error: 'Missing token' });
  const { child_id, date_start } = req.query;
  try {
    const params = new URLSearchParams({ child_id });
    if (date_start) params.set('date_start', date_start);
    const tcRes = await fetch(`${TC}/activity.json?${params}`, {
      headers: { 'X-TransparentClassroomToken': token, 'X-TransparentClassroomSchoolId': schoolId }
    });
    res.status(tcRes.status).json(await tcRes.json());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`TC Proxy running on port ${PORT}`));
