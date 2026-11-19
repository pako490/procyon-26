import { auth } from "express-oauth2-jwt-bearer";
import type { Request, RequestHandler } from "express";
import { prisma } from "../lib/prisma.js";

// extend Express's Request type so middleware can attach the database's
// designer ID and route handlers can read it
declare global {
    namespace Express {
        interface Request {
            raserDesignerId?: number;
        }
    }
}

const auth0Domain = process.env.AUTH0_DOMAIN;
const auth0Audience = process.env.AUTH0_AUDIENCE;

// verifies the bearer token
export const requireAuth = auth({
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
    tokenSigningAlg: "RS256",
});

export const checkJwt = auth({
    audience: auth0Audience,
    issuerBaseURL: `https://${auth0Domain}`,
    tokenSigningAlg: "RS256",
  });

// verifies token's sub against row in db that contains that authOId to make sure it has a DESIGNER role
export const requireDesigner: RequestHandler = async (req, res, next) => {
    // requireAuth must run first; it populates req.auth from the verified token
    const auth0Id = req.auth?.payload.sub;
    if (typeof auth0Id !== "string") {
        res.status(401).json({ error: "Invalid Auth0 identity" });
        return;
    }

    try {
        const user = await prisma.user.findUnique({
            where: { auth0Id },
            select: { id: true, role: true },
        });

        if (!user || user.role !== "DESIGNER") {
            res.status(403).json({ error: "Designer access required" });
            return;
        }

        // use the database ID for ownership queries to avoid passing as part of client path
        req.raserDesignerId = user.id;
        next();
    } catch (error) {
        console.error("Failed to verify designer access:", error);
        res.status(500).json({ error: "Failed to verify designer access" });
    }
};

export function getDesignerId(req: Request): number {
    // fail if a route tries to read the ID without requireDesigner
    if (typeof req.raserDesignerId !== "number") {
        throw new Error("Designer authorization middleware was not applied");
    }

    return req.raserDesignerId;
}