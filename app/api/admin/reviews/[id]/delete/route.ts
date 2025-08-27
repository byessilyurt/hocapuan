import { prisma } from "@/app/lib/prisma";
import type { NextRequest } from "next/server";

export async function POST(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    await prisma.review.update({ where: { id }, data: { status: "deleted" } });
    return Response.json({ ok: true });
}


