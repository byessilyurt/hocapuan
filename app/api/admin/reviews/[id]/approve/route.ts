import { prisma } from "@/app/lib/prisma";
import { requireAdmin, unauthorizedResponse } from "@/app/lib/auth-helpers";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
    const admin = await requireAdmin();
    if (!admin) return unauthorizedResponse();

    const { id } = await context.params;
    const review = await prisma.review.update({ where: { id }, data: { status: "approved" } });
    // update aggregates
    const agg = await prisma.review.aggregate({ where: { instructorId: review.instructorId, status: "approved" }, _avg: { overall: true }, _count: { _all: true } });
    await prisma.instructor.update({ where: { id: review.instructorId }, data: { overallRating: agg._avg.overall ?? 0, reviewCount: agg._count._all } });
    return Response.json({ ok: true });
}


