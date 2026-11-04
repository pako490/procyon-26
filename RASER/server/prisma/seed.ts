
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

// Load AWS RDS certificate
const ca = fs.readFileSync(
    path.resolve(process.cwd(), "certs/us-east-2-bundle.pem"),
    "utf8",
);

// Configure PostgreSQL connection
const url = new URL(connectionString);

// Use the explicit SSL configuration below
url.searchParams.delete("sslmode");
url.searchParams.delete("sslrootcert");

const adapter = new PrismaPg({
    connectionString: url.toString(),
    ssl: {
        ca,
        rejectUnauthorized: true,
    },
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
