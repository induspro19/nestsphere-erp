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
        roles: ['RESIDENT', 'GATEKEEPER'],
        societyId: society.id,
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('--- 1. Generating Pass with 4-Digit Token ---');
    const createRes = await makeRequest(
      '/api/v1/visitors/pass',
      'POST',
      {
        visitorType: 'GUEST',
        visitorName: 'Rajesh Kumar',
        visitorPhone: `988${Math.floor(1000000 + Math.random() * 8999999)}`,
        purpose: 'Dinner',
        passType: 'PRE_APPROVED',
        expectedArrival: new Date().toISOString(),
        expectedExit: new Date(Date.now() + 3600 * 1000).toISOString(),
      },
      token,
      society.id
    );
    const passObj = JSON.parse(createRes.data).data;
    console.log(`Generated Pass ID: ${passObj.passNumber} | 4-Digit Token: ${passObj.otpCode}`);

    console.log('\n--- 2. Verifying Token Check-In at Security (POST /api/v1/visitors/check-in) ---');
    const checkInRes = await makeRequest(
      '/api/v1/visitors/check-in',
      'POST',
      { otpCode: passObj.otpCode },
      token,
      society.id
    );
    console.log('HTTP Status:', checkInRes.status);
    console.log('Response:', checkInRes.data);

    console.log('\n--- 3. Verifying Check-Out at Security (POST /api/v1/visitors/:id/check-out) ---');
    const checkOutRes = await makeRequest(
      `/api/v1/visitors/${passObj.id}/check-out`,
      'POST',
      null,
      token,
      society.id
    );
    console.log('HTTP Status:', checkOutRes.status);
    console.log('Response:', checkOutRes.data);

  } catch (err) {
    console.error('Execution Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
