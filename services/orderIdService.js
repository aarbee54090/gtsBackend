const Order = require("../models/Order");

// No ambiguous characters (0/O, 1/I), matching spec's requirement that the
// order ID be non-sequential and hard to guess - this is the ONLY key used
// for customer-facing order lookup (no login, no second factor).
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode(length = 8) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

// Generates a unique order ID, retrying on the (extremely unlikely)
// collision. Bounded retry count so this can never loop forever.
async function generateOrderId() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = `GTS-${randomCode()}`;
    const exists = await Order.exists({ orderId: candidate });
    if (!exists) return candidate;
  }
  throw new Error("Could not generate a unique order ID after 10 attempts");
}

module.exports = { generateOrderId };