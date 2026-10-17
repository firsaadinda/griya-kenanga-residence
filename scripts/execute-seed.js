const fs = require('fs');
const https = require('https');

const sql = fs.readFileSync('scripts/seed.sql', 'utf-8');
const data = JSON.stringify({ query: sql });

const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) {
  console.error("SUPABASE_ACCESS_TOKEN is required in environment variables.");
  process.exit(1);
}

console.log('Sending seed.sql to Supabase database...');

const req = https.request({
  hostname: 'api.supabase.com',
  path: '/v1/projects/pihyqhhckltsqblktawg/database/query',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Status code:', res.statusCode);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('Seeding completed successfully!');
    } else {
      console.error('Error response:', body);
    }
  });
});

req.on('error', err => {
  console.error('Request error:', err);
});

req.write(data);
req.end();
