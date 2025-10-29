import { prisma } from "@/app/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VerifySchema = z.object({
  token: z.string().min(1),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = VerifySchema.safeParse(json);
  if (!parsed.success) return Response.json({ ok: false, error: "Geçersiz istek" }, { status: 400 });

  const { token } = parsed.data;

  // Find the verification token
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken) {
    return Response.json({ ok: false, error: "Geçersiz veya süresi dolmuş token" }, { status: 400 });
  }

  // Check if token is expired
  if (verificationToken.expires < new Date()) {
    // Delete expired token
    await prisma.verificationToken.delete({ where: { token } });
    return Response.json({ ok: false, error: "Token süresi dolmuş" }, { status: 400 });
  }

  // Find user by email (identifier)
  const user = await prisma.user.findUnique({ where: { email: verificationToken.identifier } });
  if (!user) {
    return Response.json({ ok: false, error: "Kullanıcı bulunamadı" }, { status: 404 });
  }

  // Update user's emailVerifiedAt
  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerifiedAt: new Date() },
  });

  // Delete the used token
  await prisma.verificationToken.delete({ where: { token } });

  return Response.json({ ok: true, message: "Email başarıyla doğrulandı" });
}
