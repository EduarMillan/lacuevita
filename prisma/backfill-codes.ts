import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL || "";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode(): string {
  let code = "LC-";
  for (let i = 0; i < 6; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

async function main() {
  const listings = await prisma.listing.findMany({
    where: { code: null },
    select: { id: true },
  });

  console.log(`Found ${listings.length} listings without code`);

  for (const listing of listings) {
    let code = generateCode();
    // Retry on collision
    let attempts = 0;
    while (attempts < 10) {
      try {
        await prisma.listing.update({
          where: { id: listing.id },
          data: { code },
        });
        console.log(`  ${listing.id} → ${code}`);
        break;
      } catch {
        code = generateCode();
        attempts++;
      }
    }
  }

  console.log("Done!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
