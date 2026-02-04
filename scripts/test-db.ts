// scripts/test-db.ts
import 'dotenv/config'
import { prisma } from "@/lib/prisma";

async function testDb() {
  const result = await prisma.$queryRaw`SELECT 1`;
  console.log("DB connected:", result);
  process.exit(0);
}

testDb().catch((e) => {
  console.error("DB connection failed", e);
  process.exit(1);
});
