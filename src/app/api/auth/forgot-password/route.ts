import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { generateRandomToken, hashToken } from "@/lib/security";

const forgotSchema = z.object({
  email: z.email().max(190),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase().trim();
    const user = await db.user.findUnique({ where: { email } });

    if (user) {
      const token = generateRandomToken(24);
      const tokenHash = hashToken(token);
      const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

      await db.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

      if (process.env.NODE_ENV !== "production") {
        const resetUrl = `${new URL(request.url).origin}/portal/reset-password?token=${token}`;

        return NextResponse.json({
          message: "Reset link generated (dev mode)",
          resetToken: token,
          resetUrl,
        });
      }
    }

    return NextResponse.json({
      message: "If this email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error", error);
    return NextResponse.json({ message: "Failed to process request" }, { status: 500 });
  }
}
