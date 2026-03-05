import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export async function requireStudentSession() {
  const session = await getSession();

  if (!session) {
    redirect("/portal/login");
  }

  if (session.role === "ADMIN") {
    redirect("/admin");
  }

  return session;
}

export async function requireAdminSession() {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  if (session.role !== "ADMIN") {
    redirect("/portal");
  }

  return session;
}

export async function requireContentEditorSession() {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  if (session.role !== "ADMIN" && session.role !== "CONTENT_EDITOR") {
    redirect("/portal");
  }

  return session;
}
