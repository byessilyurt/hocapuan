import { prisma } from "@/app/lib/prisma";
import { requireAdmin, unauthorizedResponse } from "@/app/lib/auth-helpers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return unauthorizedResponse();

  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      review: {
        include: {
          instructor: {
            include: {
              university: true,
              department: true,
            },
          },
          user: true,
        },
      },
      user: true,
    },
    take: 100,
  });

  return Response.json({ ok: true, data: reports });
}
