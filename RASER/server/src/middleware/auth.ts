import { auth } from "express-oauth2-jwt-bearer";
import type { Request, RequestHandler } from "express";
import { prisma } from "../lib/prisma.js";

// extend Express's Request type so middleware can attach the database's
// designer ID and route handlers can read it
declare global {
    namespace Express {
        interface Request {
            raserDesignerId?: number;
            raserEditorId?: number;
        }
    }
}

const auth0Domain = process.env.AUTH0_DOMAIN;
const auth0Audience = process.env.AUTH0_AUDIENCE;
const auth0BaseURL = process.env.AUTH0_ISSUER_BASE_URL;

// verifies the bearer token
// export const requireAuth = auth({
//     audience: auth0Audience,
//     issuerBaseURL: auth0BaseURL,
//     tokenSigningAlg: "RS256",
// });

const jwtMiddleware = auth({
    audience: auth0Audience,
    issuerBaseURL: auth0BaseURL,
    tokenSigningAlg: "RS256",
})

export const requireAuth: RequestHandler = (req, res, next) => {
    const start = Date.now();

    console.log("[AUTH] Starting JWT verification");

    jwtMiddleware(req, res, (err) => {
        console.log("[AUTH] Verification finished", {
            duration: Date.now() - start,
        });

        if (err) {
            console.error("[AUTH] Verification failed:", err);
            return next(err);
        }

        console.log("[AUTH] Verification successful");
        next();
    });
};

export const checkJwt = requireAuth;


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

// verifies token's sub against a user row and requires the EDITOR role
export const requireEditor: RequestHandler = async (req, res, next) => {
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

        if (!user || user.role !== "EDITOR") {
            res.status(403).json({ error: "Editor access required" });
            return;
        }

        req.raserEditorId = user.id;
        next();
    } catch (error) {
        console.error("Failed to verify editor access:", error);
        res.status(500).json({ error: "Failed to verify editor access" });
    }
};

export function getEditorId(req: Request): number {
    if (typeof req.raserEditorId !== "number") {
        throw new Error("Editor authorization middleware was not applied");
    }

    return req.raserEditorId;
}