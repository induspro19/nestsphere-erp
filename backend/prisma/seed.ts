import { PrismaClient, RoleType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Executing Database Seed Architecture (System Roles & Permissions)...');

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

  console.log('✅ Database Seed Architecture complete. Zero demo/placeholder data created.');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
