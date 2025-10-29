import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "./prisma";

/**
 * Get the current user from the session
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  return await prisma.user.findUnique({ where: { email: session.user.email } });
}

/**
 * Verify that the current user is an admin
 * Returns the user if admin, null otherwise
 */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return null;
  return user;
}

/**
 * Create an unauthorized response
 */
export function unauthorizedResponse(message: string = "Yetkisiz erişim") {
  return Response.json({ ok: false, error: message }, { status: 403 });
}
