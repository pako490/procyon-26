import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.js";
import fs from "node:fs";
import path from "node:path";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing");
}

const url = new URL(connectionString);

// Prevent URL parameters from overriding the SSL configuration
url.searchParams.delete("sslmode");
url.searchParams.delete("sslrootcert");

//added cert to give perms to edit db in prod
const ca = fs.readFileSync(
  path.join(process.cwd(), "certs", "us-east-2-bundle.pem"),
  "utf8",
);

const adapter = new PrismaPg({
  connectionString: url.toString(),
  ssl: {
    ca,
    rejectUnauthorized: true,
  },
});

export const prisma = new PrismaClient({ adapter });