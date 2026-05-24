/**
 * AKP Consulting — Firebase Admin: Set Custom Claims
 *
 * This script grants a custom role claim to a Firebase Auth user.
 * Storage rules read request.auth.token.role to enforce admin-only writes
 * (since Storage rules cannot access Firestore directly).
 *
 * ── Prerequisites ──────────────────────────────────────────────────────────
 *
 *   1. Install firebase-admin (one-time, run from the workspace root):
 *        pnpm add -D firebase-admin --filter @workspace/scripts
 *
 *   2. Download a Firebase service account key:
 *        Firebase Console → Project Settings → Service accounts
 *        → Generate new private key → save as scripts/service-account.json
 *        (this file is gitignored — never commit it)
 *
 *   3. Run this script:
 *        pnpm --filter @workspace/scripts tsx src/set-admin-claims.ts \
 *          --uid <firebase-user-uid> \
 *          --role super_admin
 *
 * ── Available roles ────────────────────────────────────────────────────────
 *   super_admin | admin_staff | instructor | accounting_partner | client | student
 *
 * ── Effect ─────────────────────────────────────────────────────────────────
 *   Sets request.auth.token.role on the user's ID token.
 *   Storage rules check this claim for admin-only write paths.
 *   Firestore rules read the role from the users/{uid} document instead
 *   (no custom claims needed for Firestore rules).
 *
 * ── Revoke a claim ─────────────────────────────────────────────────────────
 *   Run with --role client (or any non-admin role) to downgrade a user.
 */

import * as admin from "firebase-admin";
import { readFileSync } from "fs";
import { resolve } from "path";

const VALID_ROLES = [
  "super_admin",
  "admin_staff",
  "instructor",
  "accounting_partner",
  "client",
  "student",
] as const;

type Role = (typeof VALID_ROLES)[number];

function parseArgs(): { uid: string; role: Role } {
  const args = process.argv.slice(2);
  const get = (flag: string) => {
    const i = args.indexOf(flag);
    return i !== -1 ? args[i + 1] : undefined;
  };

  const uid = get("--uid");
  const role = get("--role") as Role | undefined;

  if (!uid) {
    console.error("Error: --uid <firebase-user-uid> is required");
    process.exit(1);
  }
  if (!role || !VALID_ROLES.includes(role)) {
    console.error(`Error: --role must be one of: ${VALID_ROLES.join(", ")}`);
    process.exit(1);
  }

  return { uid, role };
}

async function main() {
  const { uid, role } = parseArgs();

  const serviceAccountPath = resolve(__dirname, "../../service-account.json");
  let serviceAccount: admin.ServiceAccount;

  try {
    serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8")) as admin.ServiceAccount;
  } catch {
    console.error(
      `Error: Could not read service account key at:\n  ${serviceAccountPath}\n\n` +
      "Download it from Firebase Console → Project Settings → Service accounts → Generate new private key"
    );
    process.exit(1);
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  const auth = admin.auth();

  // Verify user exists before setting claims
  let userRecord: admin.auth.UserRecord;
  try {
    userRecord = await auth.getUser(uid);
  } catch {
    console.error(`Error: No Firebase Auth user found with UID: ${uid}`);
    process.exit(1);
  }

  // Set the role custom claim
  await auth.setCustomUserClaims(uid, { role });

  console.log(
    `✓ Custom claim set:\n` +
    `  User:  ${userRecord.email ?? uid}\n` +
    `  UID:   ${uid}\n` +
    `  Role:  ${role}\n\n` +
    `The user must sign out and sign back in (or refresh their ID token)\n` +
    `for the new claim to take effect in Storage rules.\n\n` +
    `To force immediate token refresh on the client:\n` +
    `  await auth.currentUser?.getIdToken(/* forceRefresh */ true);`
  );
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
