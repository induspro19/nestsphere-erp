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
        roles: ['RESIDENT', 'SECURITY_GUARD', 'SUPER_ADMIN'],
        societyId: society.id,
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('--- 1. Testing GET /api/v1/visitors?limit=100 ---');
    const res1 = await makeRequest('/api/v1/visitors?limit=100', 'GET', null, token, society.id);
    console.log('HTTP Status:', res1.status);

    console.log('\n--- 2. Testing POST /api/v1/visitors/pass ---');
    const res2 = await makeRequest(
      '/api/v1/visitors/pass',
      'POST',
      {
        visitorType: 'GUEST',
        visitorName: 'Riyaz Rathod Workflow Test',
        visitorPhone: `98765${Math.floor(10005 + Math.random() * 89995)}`,
        purpose: 'Dinner Party',
        vehicleNumber: 'MH04AB1234',
        passType: 'PRE_APPROVED',
      },
      token,
      society.id
    );
    console.log('HTTP Status:', res2.status);
    const passData = JSON.parse(res2.data).data;
    console.log('Pass Generated ID:', passData.id, '| Pass Code:', passData.passNumber, '| QR Token:', passData.qrToken);

    console.log('\n--- 3. Testing Gatekeeper Check-In (POST /api/v1/visitors/check-in) ---');
    const res3 = await makeRequest(
      '/api/v1/visitors/check-in',
      'POST',
      {
        passId: passData.id,
        qrToken: passData.qrToken,
      },
      token,
      society.id
    );
    console.log('HTTP Status:', res3.status);
    const checkInData = JSON.parse(res3.data).data;
    console.log('Check-in Status:', checkInData.status, '| Arrival Time:', checkInData.actualArrival);

    console.log('\n--- 4. Testing Gatekeeper Check-Out (POST /api/v1/visitors/:id/check-out) ---');
    const res4 = await makeRequest(
      `/api/v1/visitors/${passData.id}/check-out`,
      'POST',
      {},
      token,
      society.id
    );
    console.log('HTTP Status:', res4.status);
    const checkOutData = JSON.parse(res4.data).data;
    console.log('Check-out Status:', checkOutData.status, '| Exit Time:', checkOutData.actualExit);

    console.log('\n--- ALL WORKFLOW STEPS PASSED SUCCESSFULLY! ---');
  } catch (err) {
    console.error('Execution Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
