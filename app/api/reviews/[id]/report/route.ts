import { prisma } from "@/app/lib/prisma";
import type { NextRequest } from "next/server";
import { z } from "zod";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ReportSchema = z.object({
  reason: z.enum(["Hakaret", "Yanlış bilgi", "Kişisel veri", "Diğer"]).or(z.string().min(2).max(100)),
  details: z.string().max(500).optional(),
});

async function userFromRequest(req: Request) {
  const userId = req.headers.get("x-user-id");
  return userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await userFromRequest(request as unknown as Request);
  const json = await request.json().catch(() => null);
  const parsed = ReportSchema.safeParse(json);
  if (!parsed.success) return Response.json({ ok: false, error: "Geçersiz" }, { status: 400 });
  const report = await prisma.report.create({
    data: {
      reviewId: (await context.params).id,
      userId: user?.id,
      reason: String(parsed.data.reason),
      details: parsed.data.details,
    },
  });
  return Response.json({ ok: true, data: report });
}


