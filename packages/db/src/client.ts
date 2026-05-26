import { PrismaClient } from "@prisma/client";
import "dotenv/config";

declare global {
  var prisma: PrismaClient | undefined;
}

export const createClient = () => {
  if (global.prisma) {
    return global.prisma;
  }

  const URL = process.env.DATABASE_URL;
  if (!URL) {
    throw new Error(
      "DATABASE_URL is not set. Set it in environment or packages/db/.env",
    );
  }

  const prisma = new PrismaClient({
    datasourceUrl: URL,
  });

  console.log("Connected to database");
  console.log(URL);

  global.prisma = prisma;
  return prisma;
};

export const client = {
  get db() {
    return createClient();
  },
};
