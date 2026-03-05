import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashToken } from "@/lib/security";

const resetSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(100),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const tokenHash = hashToken(parsed.data.token);

    const resetEntry = await db.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!resetEntry || resetEntry.usedAt || resetEntry.expiresAt < new Date()) {
      return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);

    await db.$transaction([
      db.user.update({
        where: { id: resetEntry.userId },
        data: {
          passwordHash,
        },
      }),
      db.passwordResetToken.update({
        where: { id: resetEntry.id },
        data: {
          usedAt: new Date(),
        },
      }),
      db.passwordResetToken.updateMany({
        where: {
          userId: resetEntry.userId,
          usedAt: null,
          id: { not: resetEntry.id },
        },
        data: {
          usedAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error", error);
    return NextResponse.json({ message: "Failed to reset password" }, { status: 500 });
  }
}
