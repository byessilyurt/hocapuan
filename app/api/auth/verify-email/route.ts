import { prisma } from "@/app/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VerifySchema = z.object({
  email: z.string().email(),
});

// Simplified verify endpoint to mark emailVerifiedAt (in real flow, token-based)
export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = VerifySchema.safeParse(json);
  if (!parsed.success) return Response.json({ ok: false, error: "Geçersiz istek" }, { status: 400 });
  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return Response.json({ ok: false, error: "Kullanıcı bulunamadı" }, { status: 404 });
  await prisma.user.update({ where: { id: user.id }, data: { emailVerifiedAt: new Date() } });
  return Response.json({ ok: true });
}


