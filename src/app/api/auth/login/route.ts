import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { setSessionCookie } from "@/lib/auth";
import { getClientIp, getUserAgent } from "@/lib/request-meta";

const loginSchema = z.object({
  email: z.email().max(190),
  password: z.string().min(1).max(100),
});

export async function POST(request: Request) {
  try {
    const ipAddress = getClientIp(request.headers);
    const userAgent = getUserAgent(request.headers);
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase().trim();

    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      await db.loginActivity.create({
        data: {
          email,
          success: false,
          ipAddress,
          userAgent,
        },
      });
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(parsed.data.password, user.passwordHash);

    if (!isValidPassword) {
      await db.loginActivity.create({
        data: {
          userId: user.id,
          email: user.email,
          role: user.role,
          success: false,
          ipAddress,
          userAgent,
        },
      });
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    await setSessionCookie({
      sub: user.id,
      role: user.role,
      email: user.email,
      fullName: user.fullName,
    });

    await db.loginActivity.create({
      data: {
        userId: user.id,
        email: user.email,
        role: user.role,
        success: true,
        ipAddress,
        userAgent,
      },
    });

    return NextResponse.json({
      message: "Login successful",
      role: user.role,
    });
  } catch (error) {
    console.error("Login error", error);
    return NextResponse.json({ message: "Failed to login" }, { status: 500 });
  }
}
