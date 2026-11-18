
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Verify DATABASE_URL exists
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
                ?? path.resolve(process.cwd(), "certs/us-east-2-bundle.pem"),
            "utf8",
        ),
        rejectUnauthorized: true,
    }
    : false;

const adapter = new PrismaPg({
    connectionString: url.toString(),
    ssl,
});

const prisma = new PrismaClient({ adapter });

// Seed users
async function main() {
    const users = [
    {
        email: "designer1234@raser.com",
        name: "the designer",
        role: "DESIGNER" as const,
    },
    {
        email: "editor@raser.com",
        name: "the editor",
        role: "EDITOR" as const
    }
    ];    

    for (const user of users) {
    await prisma.user.upsert({
        where: {
        email: user.email,
        },
        update: {
        name: user.name,
        role: user.role,
        },
        create: user,
    });
    }

    console.log("Users seeded successfully");
}

main()
    .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
    })
    .finally(async () => {
    await prisma.$disconnect();
    });
