import { prisma } from "@/app/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const status = statusParam === "approved" || statusParam === "hidden" || statusParam === "deleted" ? statusParam : "pending";
    const data = await prisma.review.findMany({
        where: { status },
        orderBy: { createdAt: "desc" },
        include: { instructor: { include: { university: true, department: true } }, user: true, tags: true },
        take: 50,
    });
    return Response.json({ ok: true, data });
}


