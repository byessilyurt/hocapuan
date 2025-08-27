import { z } from "zod";
import { prisma } from "@/app/lib/prisma";
import { hash } from "bcrypt";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = RegisterSchema.safeParse(json);
    if (!parsed.success) {
      return Response.json({ ok: false, error: "Geçersiz alanlar" }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return Response.json({ ok: false, error: "Bu email zaten kayıtlı" }, { status: 400 });
    }
    const passwordHash = await hash(password, 10);
    const isEduVerified = email.endsWith(".edu.tr");
    await prisma.user.create({ data: { email, passwordHash, isEduVerified } });
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
  }
}


