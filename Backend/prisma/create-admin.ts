import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const accounts = [
  {
    firstName: "Group",
    lastName: "Admin",
    email: "admin@groupbuying.in",
    phone: "9999999999",
    role: Role.SUPER_ADMIN,
  },
  {
    firstName: "Portal",
    lastName: "Manager",
    email: "manager@groupbuying.in",
    phone: "8888888888",
    role: Role.ADMIN,
  },
] as const;

async function main() {
  const password = await bcrypt.hash("Admin@1234", 10);

  for (const account of accounts) {
    const user = await prisma.user.upsert({
      where: { email: account.email },
      update: {
        password,
        role: account.role,
        firstName: account.firstName,
        lastName: account.lastName,
        phone: account.phone,
      },
      create: {
        ...account,
        password,
      },
    });

    console.log(`Ready: ${user.email} (${user.role})`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
