const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;
const TC = 'https://www.transparentclassroom.com/api/v1';

app.use(express.json());

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

app.get('/', function(req, res) {
  res.json({ status: 'MAC TC Proxy is running', cors: 'enabled' });
});

app.post('/auth', async function(req, res) {
  try {
    const { email, password } = req.body;
    const tcRes = await fetch(TC + '/authenticate.json', {
      headers: { 'Authorization': 'Basic ' + Buffer.from(email + ':' + password).toString('base64') }
    });
    const data = await tcRes.json();
    res.json(data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/children', async function(req, res) {
  try {
    const tcRes = await fetch(TC + '/children.json?only_current=true', {
      headers: {
        'X-TransparentClassroomToken': req.headers['x-tc-token'],
        'X-TransparentClassroomSchoolId': req.headers['x-tc-school-id']
      }
    });
    res.json(await tcRes.json());
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/activity', async function(req, res) {
  try {
    const tcRes = await fetch(TC + '/activity.json?child_id=' + req.query.child_id + '&date_start=' + (req.query.date_start || ''), {
      headers: {
        'X-TransparentClassroomToken': req.headers['x-tc-token'],
        'X-TransparentClassroomSchoolId': req.headers['x-tc-school-id']
      }
    });
    res.json(await tcRes.json());
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, function() {
  console.log('Running on port ' + PORT);
});
