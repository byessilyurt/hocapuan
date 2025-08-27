import { z } from "zod";
import { prisma } from "@/app/lib/prisma";
import { compare } from "bcrypt";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = LoginSchema.safeParse(json);
  if (!parsed.success) return Response.json({ ok: false, error: "Geçersiz" }, { status: 400 });
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return Response.json({ ok: false, error: "Geçersiz bilgiler" }, { status: 400 });
  const ok = await compare(password, user.passwordHash);
  if (!ok) return Response.json({ ok: false, error: "Geçersiz bilgiler" }, { status: 400 });
  return Response.json({ ok: true, data: { id: user.id, email: user.email } });
}


