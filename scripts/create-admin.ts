import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'many@manyphotography.com';
  const password = process.env.ADMIN_PASSWORD || 'change-me-immediately';
  const name = 'Many';

  if (password === 'change-me-immediately') {
    console.warn('⚠️  Using default password. Set ADMIN_PASSWORD in your .env before running this script.');
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await prisma.admin.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      name,
    },
    create: {
      email,
      password: hashedPassword,
      name,
    },
  });

  console.log(`✅ Admin created/updated: ${admin.email}`);
  console.log(`   ⚠️  Ensure you are using a strong, unique password in production!`);
}

main()
  .catch((e) => {
    console.error('Failed to create admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
