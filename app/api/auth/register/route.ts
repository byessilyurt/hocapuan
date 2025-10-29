import { z } from "zod";
import { prisma } from "@/app/lib/prisma";
import { hash } from "bcrypt";
import { generateVerificationToken, sendVerificationEmail } from "@/app/lib/email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        isEduVerified,
        emailVerifiedAt: isEduVerified ? new Date() : null,
      },
    });

    // Send verification email for non-.edu.tr emails
    if (!isEduVerified && (process.env.RESEND_API_KEY || process.env.SMTP_HOST)) {
      try {
        const token = await generateVerificationToken(email);
        await sendVerificationEmail(email, token);
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        // Don't fail registration if email sending fails
      }
    }

    return Response.json({ ok: true, data: { requiresVerification: !isEduVerified } });
  } catch {
    return Response.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
  }
}


