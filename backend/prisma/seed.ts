import { PrismaClient, RoleType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Executing Database Seed Architecture (System Roles & Seed Users)...');

  // 1. Seed Enterprise System Roles
  const roles: { code: RoleType; name: string; description: string }[] = [
    { code: RoleType.SUPER_ADMIN, name: 'Super Admin', description: 'SaaS Platform Owner with Global Privileges' },
    { code: RoleType.SOCIETY_ADMIN, name: 'Society Admin', description: 'Full Administrative Access within Tenant Society' },
    { code: RoleType.COMMITTEE, name: 'Committee Member', description: 'Management Committee Executive Board Member' },
    { code: RoleType.SECURITY, name: 'Security Guard', description: 'Gatekeeper, Visitor Log, and Security Management' },
    { code: RoleType.RESIDENT, name: 'Resident Owner', description: 'Flat Owner Resident' },
    { code: RoleType.TENANT, name: 'Tenant Occupant', description: 'Verified Tenant Resident' },
    { code: RoleType.VENDOR, name: 'Vendor / Contractor', description: 'External Service Vendor' },
    { code: RoleType.MAINTENANCE_STAFF, name: 'Maintenance Staff', description: 'Technicians, Cleaners, and Electricians' },
  ];

  for (const r of roles) {
    await prisma.role.upsert({
      where: { code: r.code },
      update: { name: r.name, description: r.description },
      create: { code: r.code, name: r.name, description: r.description },
    });
  }

  // 2. Seed Foundation Permissions
  const permissions = [
    { code: 'society:read', module: 'SOCIETY', description: 'View Society Profile' },
    { code: 'society:write', module: 'SOCIETY', description: 'Edit Society Details' },
    { code: 'building:read', module: 'BUILDING', description: 'View Buildings & Wings' },
    { code: 'building:write', module: 'BUILDING', description: 'Manage Buildings & Wings' },
    { code: 'flat:read', module: 'FLAT', description: 'View Flats & Occupancy' },
    { code: 'flat:write', module: 'FLAT', description: 'Manage Flat Records' },
    { code: 'users:read', module: 'USER', description: 'View User Accounts' },
    { code: 'users:write', module: 'USER', description: 'Manage User Accounts & Roles' },
  ];

  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { code: p.code },
      update: { module: p.module, description: p.description },
      create: { code: p.code, module: p.module, description: p.description },
    });
  }

  // 3. Seed Default Foundation Society
  const society = await prisma.society.upsert({
    where: { code: 'GFH-001' },
    update: {},
    create: {
      name: 'Greenfield Heights Cooperative Society',
      code: 'GFH-001',
      registrationNo: 'SOC-2026-001',
      societyTypeCode: 'HOUSING',
      addressLine1: '123 Palm Avenue, Bandra West',
      pincode: '400050',
      contactEmail: 'admin@greenfield.com',
      contactPhone: '9876543210',
      status: 'ACTIVE',
      isOnboarded: true,
    },
  });

  // 4. Seed E2E Test Resident User & Person Profile
  const passwordHash = await bcrypt.hash('password123', 10);

  const residentRole = await prisma.role.findUnique({ where: { code: RoleType.RESIDENT } });

  const residentUser = await prisma.user.upsert({
    where: { email: 'resident@nestsphere.local' },
    update: { passwordHash, status: 'ACTIVE', societyId: society.id },
    create: {
      email: 'resident@nestsphere.local',
      phone: '9876543211',
      passwordHash,
      firstName: 'Resident',
      lastName: 'User',
      societyId: society.id,
      status: 'ACTIVE',
    },
  });

  if (residentRole) {
    await prisma.userRole.upsert({
      where: { id: `ur-${residentUser.id}` },
      update: {},
      create: {
        id: `ur-${residentUser.id}`,
        userId: residentUser.id,
        roleId: residentRole.id,
      },
    }).catch(() => {});
  }

  await prisma.person.upsert({
    where: { digitalId: 'PRN-00001' },
    update: { email: 'resident@nestsphere.local', userId: residentUser.id },
    create: {
      societyId: society.id,
      userId: residentUser.id,
      digitalId: 'PRN-00001',
      digitalIdQrToken: 'QR-RESIDENT-00001',
      firstName: 'Resident',
      lastName: 'User',
      email: 'resident@nestsphere.local',
      phone: '9876543211',
      gender: 'MALE',
      kycStatus: 'VERIFIED',
      status: 'ACTIVE',
    },
  });

  // 5. Seed E2E Test Admin User & Person Profile
  const adminRole = await prisma.role.findUnique({ where: { code: RoleType.SOCIETY_ADMIN } });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@nestsphere.local' },
    update: { passwordHash, status: 'ACTIVE', societyId: society.id },
    create: {
      email: 'admin@nestsphere.local',
      phone: '9876543212',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      societyId: society.id,
      status: 'ACTIVE',
    },
  });

  if (adminRole) {
    await prisma.userRole.upsert({
      where: { id: `ur-${adminUser.id}` },
      update: {},
      create: {
        id: `ur-${adminUser.id}`,
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    }).catch(() => {});
  }

  await prisma.person.upsert({
    where: { digitalId: 'PRN-00002' },
    update: { email: 'admin@nestsphere.local', userId: adminUser.id },
    create: {
      societyId: society.id,
      userId: adminUser.id,
      digitalId: 'PRN-00002',
      digitalIdQrToken: 'QR-ADMIN-00002',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@nestsphere.local',
      phone: '9876543212',
      gender: 'MALE',
      kycStatus: 'VERIFIED',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Database Seed Architecture complete. Seeded resident@nestsphere.local for E2E testing.');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
