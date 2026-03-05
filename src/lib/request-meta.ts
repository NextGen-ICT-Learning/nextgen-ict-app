export function getClientIp(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? null;
  }

  return headers.get("x-real-ip") ?? null;
}

export function getUserAgent(headers: Headers) {
  return headers.get("user-agent") ?? null;
}
