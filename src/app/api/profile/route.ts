import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

const profileSchema = z.object({
  fullName: z.string().min(2).max(80),
  phone: z.string().max(40).optional().or(z.literal("")),
  guardianName: z.string().max(80).optional().or(z.literal("")),
  guardianPhone: z.string().max(40).optional().or(z.literal("")),
  program: z.string().max(120).optional().or(z.literal("")),
  batch: z.string().max(120).optional().or(z.literal("")),
});

function normalizeNullable(value?: string) {
  if (!value || value.trim() === "") return null;
  return value.trim();
}

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      phone: true,
      guardianName: true,
      guardianPhone: true,
      program: true,
      batch: true,
    },
  });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PUT(request: Request) {
  const session = await getSession();

  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid profile payload" }, { status: 400 });
    }

    const updated = await db.user.update({
      where: { id: session.sub },
      data: {
        fullName: parsed.data.fullName.trim(),
        phone: normalizeNullable(parsed.data.phone),
        guardianName: normalizeNullable(parsed.data.guardianName),
        guardianPhone: normalizeNullable(parsed.data.guardianPhone),
        program: normalizeNullable(parsed.data.program),
        batch: normalizeNullable(parsed.data.batch),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        phone: true,
        guardianName: true,
        guardianPhone: true,
        program: true,
        batch: true,
      },
    });

    return NextResponse.json({ message: "Profile updated", user: updated });
  } catch (error) {
    console.error("Profile update error", error);
    return NextResponse.json({ message: "Failed to update profile" }, { status: 500 });
  }
}
