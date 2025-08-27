import NextAuth, { type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/app/lib/prisma";
import { compare } from "bcrypt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    verifyRequest: "/auth/verify",
  },
  providers: [
    Credentials({
      name: "Email ve Şifre",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials): Promise<{ id: string; email: string; role: "admin" | "user" } | null> {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) return null;
        const isValid = await compare(credentials.password, user.passwordHash);
        if (!isValid) return null;
        return {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      },
    }),
    EmailProvider({
      server: process.env.RESEND_API_KEY
        ? undefined
        : {
          host: process.env.SMTP_HOST!,
          port: Number(process.env.SMTP_PORT ?? 587),
          auth: {
            user: process.env.SMTP_USER!,
            pass: process.env.SMTP_PASS!,
          },
        },
      from: process.env.EMAIL_FROM!,
      // For Resend on Vercel, we'll use NextAuth's default email delivery via nodemailer + Resend SMTP or API layer
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // attach role info
        token.role = (user as { role?: "admin" | "user" }).role ?? "user";
      }
      return token;
    },
    async session({ session, token }) {
      (session as { role?: "admin" | "user" }).role = (token as { role?: "admin" | "user" }).role ?? "user";
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };


