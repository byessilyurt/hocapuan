import { prisma } from "@/app/lib/prisma";

async function userFromRequest(req: Request) {
  const userId = req.headers.get("x-user-id");
  if (!userId) return null;
  return await prisma.user.findUnique({ where: { id: userId } });
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await userFromRequest(request);
  if (!user) return Response.json({ ok: false, error: "Giriş gerekli" }, { status: 401 });
  const { id } = params;
  try {
    await prisma.helpfulVote.create({ data: { reviewId: id, userId: user.id } });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: "Zaten oy verdiniz" }, { status: 400 });
  }
}


