import { prisma } from "@/app/lib/prisma";
import { requireAdmin, unauthorizedResponse } from "@/app/lib/auth-helpers";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
    const admin = await requireAdmin();
    if (!admin) return unauthorizedResponse();

    const { id } = await context.params;
    await prisma.review.update({ where: { id }, data: { status: "deleted" } });
    return Response.json({ ok: true });
}


