import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { Role } from "@prisma/client";
import { hash } from "bcryptjs";
import prisma from "../lib/prisma";

async function main() {
  console.log("Seeding database...");

  // 1. Create Admin User (only once)
  const adminEmail = process.env.ADMIN_EMAIL || "admin@bookdepot.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "StrongPass123!";

  const existingAdmin = await prisma.user.findFirst({
    where: {
      OR: [
        { role: Role.ADMIN },
        { email: adminEmail },
      ],
    },
  });

  if (existingAdmin) {
    console.log(
      `Admin user already exists (${existingAdmin.email}, role: ${existingAdmin.role}). Skipping seed user creation.`
    );
  } else {
    const hashedAdminPassword = await hash(adminPassword, 12);
    const admin = await prisma.user.create({
      data: {
        name: "Admin Mirza",
        email: adminEmail,
        passwordHash: hashedAdminPassword,
        role: Role.ADMIN,
        phone: "03336566000",
      },
    });
    console.log(`Seed admin user created: ${admin.email}`);
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
