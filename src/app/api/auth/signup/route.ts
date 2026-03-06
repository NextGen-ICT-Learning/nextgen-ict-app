import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { buildStarterInvoices } from "@/lib/invoice";
import { setSessionCookie } from "@/lib/auth";
import { generateUniqueParentAccessCode } from "@/lib/parent-access";

const signupSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.email().max(190),
  password: z.string().min(8).max(100),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid signup data" }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase().trim();
    const existing = await db.user.findUnique({ where: { email } });

    if (existing) {
      return NextResponse.json({ message: "Email already in use" }, { status: 409 });
    }

    const [passwordHash, parentAccessCode] = await Promise.all([
      bcrypt.hash(parsed.data.password, 10),
      generateUniqueParentAccessCode(),
    ]);

    const user = await db.user.create({
      data: {
        fullName: parsed.data.fullName.trim(),
        email,
        passwordHash,
        parentAccessCode,
        role: Role.STUDENT,
      },
    });

    await db.invoice.createMany({
      data: buildStarterInvoices(user.id),
    });

    await setSessionCookie({
      sub: user.id,
      role: user.role,
      email: user.email,
      fullName: user.fullName,
    });

    return NextResponse.json({
      message: "Account created",
      role: user.role,
    });
  } catch (error) {
    console.error("Signup error", error);
    return NextResponse.json({ message: "Failed to create account" }, { status: 500 });
  }
}
