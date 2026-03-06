import { randomBytes } from "node:crypto";

function normalizeCode(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

function randomToken(size = 4) {
  return randomBytes(size).toString("hex");
}

export function generateMeetingRoom(classCode: string) {
  const base = normalizeCode(classCode) || "nextgenict-class";
  return `${base}-${Date.now().toString(36)}-${randomToken(3)}`;
}

export function generateWhiteboardRoom(classCode: string) {
  const base = normalizeCode(classCode) || "nextgenict-board";
  return `${base}-${randomToken(3)}`;
}

export function generateWhiteboardKey() {
  return randomToken(16);
}

export function getJitsiDomain() {
  return process.env.NEXT_PUBLIC_JITSI_DOMAIN?.trim() || "meet.jit.si";
}

export function buildWhiteboardUrl(room: string, key: string) {
  const base = process.env.NEXT_PUBLIC_WHITEBOARD_BASE_URL?.trim() || "https://excalidraw.com";
  const safeRoom = encodeURIComponent(room);
  const safeKey = encodeURIComponent(key);
  return `${base}?embed=true&theme=light#room=${safeRoom},${safeKey}`;
}
