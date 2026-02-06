import { PrismaClient, UserRole } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await hash('123456', 10);
  const userPassword = await hash('123456', 10);

  await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@admin.com',
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: 'user@user.com' },
    update: {},
    create: {
      name: 'Usuario',
      email: 'user@user.com',
      password: userPassword,
      role: UserRole.USUARIO,
    },
  });
}

main()
  .then(() => {
    console.log('Seed executed successfully');
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
