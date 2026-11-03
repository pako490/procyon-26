
import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
    const users = [
    // probably need to add more users but for now added one
    {
        email: "designer1234@raser.com", 
        name: "the designer",
        role: "DESIGNER" as const,
    }
    ];

    for (const user of users) {
    await prisma.user.upsert({
        where: { email: user.email },
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
    .catch(console.error)
    .finally(() => prisma.$disconnect());
