
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

const namespace = "https://raser.example.com";

router.post("/sync", requireAuth, async (req, res) => {
    try { 
    const claims = req.auth?.payload;

    const auth0Id = claims?.sub;
    const email = claims?.[`${namespace}/email`];
    // const emailVerified =
    //     claims?.[`${namespace}/email_verified`];

    if (typeof auth0Id !== "string" || !auth0Id) {
        return res.status(401).json({
        error: "Invalid Auth0 identity",
        });
    }

    //checks if user already exists
    const existingUser = await prisma.user.findUnique({
        where: {
        auth0Id,
        },
    });

    if (existingUser) {
        return res.status(200).json(existingUser);
    }

    //verifies email
    if (
        typeof email !== "string" ||
        !email 
        // || emailVerified !== true
    ) {
        return res.status(403).json({
        // error: "Verified email required",
        error: "Email required"

        });
    }

    //look for the user 
    const seededUser = await prisma.user.findUnique({
        where: {
        email,
        },
    });

    if (!seededUser) {
        return res.status(403).json({
        error: "User is not registered in RASER",
        });
    }


    if (seededUser.auth0Id !== null) {
        return res.status(409).json({
        error: "User already linked to an Auth0 account",
        });
    }

    
    const linkedUserCount = await prisma.user.updateMany({
        where: {
            id: seededUser.id,
            auth0Id: null,
        },
        data: { auth0Id },
    });
    if (linkedUserCount.count === 0) {
        const alreadyLinkedUser = await prisma.user.findUnique({
            where: { auth0Id },
        });
        if (alreadyLinkedUser) {
            return res.status(200).json(alreadyLinkedUser);
        }

        return res.status(409).json({
            error: "User already linked to an Auth0 account",
        });
    }

    const updatedUser = await prisma.user.findUnique({
        where: { id: seededUser.id },
    });
    if (!updatedUser) {
        throw new Error("Linked user could not be retrieved");
    }

    return res.status(200).json(updatedUser);

    } catch (error) {
    console.error("User synchronization failed:", error);

    return res.status(500).json({
        error: "Failed to synchronize user",
    });
    }
});

export default router;
