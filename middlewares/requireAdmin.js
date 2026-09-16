// Simple static-key admin check. No login endpoint, no sessions, no JWT -
// the admin sends the same key (from .env) on every protected request via
// the "x-admin-key" header.
function requireAdmin(req, res, next) {
  const key = req.headers["x-admin-key"];

  if (!key || key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ success: false, message: "Unauthorized: invalid or missing admin key" });
  }

  next();
}

module.exports = requireAdmin;