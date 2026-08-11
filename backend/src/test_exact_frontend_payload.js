const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const http = require('http');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'super_secret_access_token_key_change_in_production_12345';

function makeRequest(path, method, body, token, societyId) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const req = http.request(
      {
        hostname: 'localhost',
        port: 4000,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          'Authorization': `Bearer ${token}`,
          'X-Society-ID': societyId || '',
        },
      },
      (res) => {
        let resData = '';
        res.on('data', (chunk) => (resData += chunk));
        res.on('end', () => {
          resolve({ status: res.statusCode, data: resData });
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function run() {
  try {
    const society = await prisma.society.findFirst();
    const user = await prisma.user.findFirst({ where: { societyId: society.id } });

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        roles: ['RESIDENT'],
        societyId: society.id,
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('--- 1. Testing GET /api/v1/visitors?limit=100 ---');
    const res1 = await makeRequest('/api/v1/visitors?limit=100', 'GET', null, token, society.id);
    console.log('HTTP Status:', res1.status);
    console.log('Response:', res1.data);

    console.log('\n--- 2. Testing POST /api/v1/visitors/pass (DATETIME-LOCAL FORMAT) ---');
    const payload = {
      visitorType: 'CAB_DRIVER',
      visitorName: 'Sunil Verma Cab',
      visitorPhone: `99900${Math.floor(10000 + Math.random() * 89999)}`,
      purpose: 'Cab Pickup',
      vehicleNumber: 'MH04AB1234',
      passType: 'PRE_APPROVED',
      expectedArrival: '2026-08-05T17:00', // HTML datetime-local input string format
      expectedExit: '2026-08-05T23:59',
    };
    console.log('Payload:', JSON.stringify(payload, null, 2));

    const res2 = await makeRequest(
      '/api/v1/visitors/pass',
      'POST',
      payload,
      token,
      society.id
    );
    console.log('HTTP Status:', res2.status);
    console.log('Response:', res2.data);

  } catch (err) {
    console.error('Execution Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
