import argon2 from "argon2";

import { prisma } from "../src/config/prisma";

const username = process.env.SEED_ADMIN_USERNAME?.trim();
const password = process.env.SEED_ADMIN_PASSWORD;

async function main() {
  if (!username) {
    throw new Error("SEED_ADMIN_USERNAME is required.");
  }

  if (!password || password.length < 12) {
    throw new Error("SEED_ADMIN_PASSWORD must contain at least 12 characters");
  }

  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
  });

  // membuat admin juga belum tersedia
  // jika username sudah ada, data tidak akan ditimpa
  const admin = await prisma.user.upsert({
    where: {
      username,
    },
    update: {},
    create: {
      username,
      passwordHash,
    },
  });
  console.log(`administrator account is ready: ${admin.username}`);
}

// menjalankan seed dan menutup koneksi database
main()
  .catch((error: unknown) => {
    console.error("Failed to seed administrator: ", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
