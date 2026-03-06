import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateUniqueParentAccessCode } from "@/lib/parent-access";

function resolveOrigin(headers: Headers) {
  const proto = headers.get("x-forwarded-proto") ?? "http";
  const host = headers.get("x-forwarded-host") ?? headers.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

export async function GET(request: Request) {
  const session = await getSession();

  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      parentAccessCode: true,
    },
  });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const code = user.parentAccessCode ?? (await generateUniqueParentAccessCode());

  if (!user.parentAccessCode) {
    await db.user.update({
      where: { id: user.id },
      data: {
        parentAccessCode: code,
      },
    });
  }

  const origin = resolveOrigin(request.headers);
  const parentAccessUrl = `${origin}/parent/attendance?code=${encodeURIComponent(code)}`;

  return NextResponse.json({ code, parentAccessUrl });
}

export async function POST(request: Request) {
  const session = await getSession();

  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const code = await generateUniqueParentAccessCode();

  await db.user.update({
    where: { id: session.sub },
    data: {
      parentAccessCode: code,
    },
  });

  const origin = resolveOrigin(request.headers);
  const parentAccessUrl = `${origin}/parent/attendance?code=${encodeURIComponent(code)}`;

  return NextResponse.json({
    message: "Parent access code regenerated",
    code,
    parentAccessUrl,
  });
}

