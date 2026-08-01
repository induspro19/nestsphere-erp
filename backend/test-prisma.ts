import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  try {
    console.log("Reached GET /people/me");
    // Simulate what happens in findOne
    const actorId = "resident@nestsphere.local"; // not a UUID
    await prisma.person.findFirst({
      where: { id: actorId, societyId: "soc-123", isDeleted: false },
    });
  } catch (e) {
    console.error("EXCEPTION CAUGHT:");
    console.error(e.stack);
  } finally {
    await prisma.$disconnect();
  }
}

run();
