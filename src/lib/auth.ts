import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { Role } from "@prisma/client";

const SESSION_COOKIE = "nextgenict_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = {
  sub: string;
  role: Role;
  email: string;
  fullName: string;
};

function getAuthSecret() {
  return process.env.AUTH_SECRET ?? "dev-insecure-secret-change-this";
}

function secretKey() {
  return new TextEncoder().encode(getAuthSecret());
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT({
    role: payload.role,
    email: payload.email,
    fullName: payload.fullName,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(secretKey());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const result = await jwtVerify(token, secretKey());
    const role = result.payload.role;
    const email = result.payload.email;
    const fullName = result.payload.fullName;
    const subject = result.payload.sub;

    if (
      typeof role !== "string" ||
      typeof email !== "string" ||
      typeof fullName !== "string" ||
      typeof subject !== "string" ||
      subject.length === 0
    ) {
      return null;
    }

    if (role !== Role.ADMIN && role !== Role.STUDENT && role !== Role.CONTENT_EDITOR) {
      return null;
    }

    return {
      sub: subject,
      role,
      email,
      fullName,
    };
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  return verifySession(token);
}

export async function setSessionCookie(payload: SessionPayload) {
  const cookieStore = await cookies();
  const token = await signSession(payload);

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
