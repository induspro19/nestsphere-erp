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

    const typesToTest = ['CAB_DRIVER', 'HOUSEKEEPING', 'FOOD_DELIVERY', 'COURIER', 'SERVICE_ENGINEER'];

    for (const vType of typesToTest) {
      console.log(`\nTesting POST /api/v1/visitors/pass with visitorType: ${vType}`);
      const res = await makeRequest(
        '/api/v1/visitors/pass',
        'POST',
        {
          visitorType: vType,
          visitorName: `Test ${vType}`,
          visitorPhone: `98700${Math.floor(10000 + Math.random() * 89999)}`,
          purpose: `Testing ${vType}`,
          passType: 'PRE_APPROVED',
        },
        token,
        society.id
      );
      console.log(`Status for ${vType}:`, res.status);
    }
  } catch (err) {
    console.error('Execution Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
