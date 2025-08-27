import { prisma } from "@/app/lib/prisma";
import type { NextRequest } from "next/server";

async function userFromRequest(req: Request) {
  const userId = req.headers.get("x-user-id");
  if (!userId) return null;
  return await prisma.user.findUnique({ where: { id: userId } });
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await userFromRequest(request as unknown as Request);
  if (!user) return Response.json({ ok: false, error: "Giriş gerekli" }, { status: 401 });
  const { id } = await context.params;
  try {
    await prisma.helpfulVote.create({ data: { reviewId: id, userId: user.id } });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: "Zaten oy verdiniz" }, { status: 400 });
  }
}


