import { auth } from "express-oauth2-jwt-bearer";

const auth0Domain = process.env.AUTH0_DOMAIN;
const auth0Audience = process.env.AUTH0_AUDIENCE;

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