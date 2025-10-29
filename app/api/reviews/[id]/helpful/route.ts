import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth-helpers";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ ok: false, error: "Giriş gerekli" }, { status: 401 });
  const { id } = await context.params;
  try {
    await prisma.helpfulVote.create({ data: { reviewId: id, userId: user.id } });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: "Zaten oy verdiniz" }, { status: 400 });
  }
}


