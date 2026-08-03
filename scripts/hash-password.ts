// Usage: node scripts/hash-password.ts <password>   (Node 23.6+ runs .ts files directly)
// Prints the ADMIN_PASSWORD_HASH value to put in .env.local, using the
// AUTH_PEPPER currently set in your environment (or empty pepper if unset).
import crypto from "node:crypto";

const password = process.argv[2];
if (!password) {
  console.error("Usage: npx tsx scripts/hash-password.ts <password>");
  process.exit(1);
}

const pepper = process.env.AUTH_PEPPER ?? "";
const hash = crypto.createHash("sha256").update(password + pepper).digest("hex");
console.log(hash);
