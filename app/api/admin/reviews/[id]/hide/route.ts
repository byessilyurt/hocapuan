import { prisma } from "@/app/lib/prisma";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    await prisma.review.update({ where: { id }, data: { status: "hidden" } });
    return Response.json({ ok: true });
}


