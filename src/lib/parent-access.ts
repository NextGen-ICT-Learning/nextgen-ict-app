import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";

function randomCode() {
  return randomBytes(9).toString("base64url").replace(/[^a-zA-Z0-9]/g, "").slice(0, 12);
}

export async function generateUniqueParentAccessCode() {
  for (let attempt = 0; attempt < 16; attempt += 1) {
    const candidate = `NGP${randomCode()}`;
    const existing = await db.user.findUnique({
      where: { parentAccessCode: candidate },
      select: { id: true },
    });
    if (!existing) {
      return candidate;
    }
  }

  throw new Error("Failed to generate unique parent access code");
}

