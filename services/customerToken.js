const crypto = require("crypto");

// No password, no OTP (product decision) - a session token is issued purely
// on phone-number lookup. Kept dependency-free (no jsonwebtoken package):
// this is just base64url(JSON payload) + "." + base64url(HMAC-SHA256 sig).
// Not encryption - the payload (a customer id + expiry) isn't secret, it
// just needs to be tamper-proof, which an HMAC already guarantees.

const SECRET = process.env.CUSTOMER_TOKEN_SECRET || "dev-only-change-me-in-render-env";
const TOKEN_TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 days - long-lived since there's no re-auth factor to renew with

function sign(encodedPayload) {
  return crypto.createHmac("sha256", SECRET).update(encodedPayload).digest("base64url");
}

function issueCustomerToken(customerId) {
  const encodedPayload = Buffer.from(
    JSON.stringify({ customerId, exp: Date.now() + TOKEN_TTL_MS })
  ).toString("base64url");
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

function verifyCustomerToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;

  const [encodedPayload, signature] = token.split(".");
  const expectedSignature = sign(encodedPayload);

  const provided = Buffer.from(signature || "");
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    if (!payload.customerId || !payload.exp || Date.now() > payload.exp) return null;
    return payload.customerId;
  } catch {
    return null;
  }
}

module.exports = { issueCustomerToken, verifyCustomerToken };
