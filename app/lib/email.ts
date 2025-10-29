import nodemailer from "nodemailer";
import { prisma } from "./prisma";

/**
 * Send a verification email to a user
 */
export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`;

  // If using Resend
  if (process.env.RESEND_API_KEY) {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: process.env.EMAIL_FROM || "HocaPuan <noreply@hocapuan.com>",
      to: email,
      subject: "Email Adresinizi Doğrulayın - HocaPuan",
      html: `
        <h2>Email Doğrulama</h2>
        <p>HocaPuan hesabınızı doğrulamak için aşağıdaki bağlantıya tıklayın:</p>
        <a href="${verifyUrl}">${verifyUrl}</a>
        <p>Bu bağlantı 24 saat geçerlidir.</p>
        <p>Eğer bu hesabı siz oluşturmadıysanız, bu emaili görmezden gelebilirsiniz.</p>
      `,
    });
  } else if (process.env.SMTP_HOST) {
    // Using SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || "HocaPuan <noreply@hocapuan.com>",
      to: email,
      subject: "Email Adresinizi Doğrulayın - HocaPuan",
      html: `
        <h2>Email Doğrulama</h2>
        <p>HocaPuan hesabınızı doğrulamak için aşağıdaki bağlantıya tıklayın:</p>
        <a href="${verifyUrl}">${verifyUrl}</a>
        <p>Bu bağlantı 24 saat geçerlidir.</p>
        <p>Eğer bu hesabı siz oluşturmadıysanız, bu emaili görmezden gelebilirsiniz.</p>
      `,
    });
  }
}

/**
 * Generate a verification token for an email
 */
export async function generateVerificationToken(email: string): Promise<string> {
  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  // Generate a random token
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);

  // Create expiry time (24 hours from now)
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Store token in database
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return token;
}
