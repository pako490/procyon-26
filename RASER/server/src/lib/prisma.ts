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
const sslMode = process.env.DATABASE_SSL_MODE?.toLowerCase()
  ?? url.searchParams.get("sslmode")?.toLowerCase();
const localHosts = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
const useTls = sslMode
  ? sslMode !== "disable"
  : !localHosts.has(url.hostname);

if (process.env.DATABASE_SSL_MODE &&
    !["disable", "require", "verify-full"].includes(process.env.DATABASE_SSL_MODE.toLowerCase())) {
  throw new Error("DATABASE_SSL_MODE must be one of: disable, require, verify-full");
}

// Prevent URL parameters from overriding the SSL configuration
url.searchParams.delete("sslmode");
url.searchParams.delete("sslrootcert");

// Load the AWS RDS CA only when TLS is enabled.
const ssl = useTls
  ? {
      ca: fs.readFileSync(
        process.env.DATABASE_SSL_ROOT_CERT
          ?? path.join(process.cwd(), "certs", "us-east-2-bundle.pem"),
        "utf8",
      ),
      rejectUnauthorized: true,
    }
  : false;

const adapter = new PrismaPg({
  connectionString: url.toString(),
  ssl,
});

export const prisma = new PrismaClient({ adapter });