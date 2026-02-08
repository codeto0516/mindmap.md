import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // DATABASE_URL が未設定でも validate / generate が通るようにフォールバック
    url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
  },
});
