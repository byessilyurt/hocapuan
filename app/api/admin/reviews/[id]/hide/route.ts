import { prisma } from "@/app/lib/prisma";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
    await prisma.review.update({ where: { id: params.id }, data: { status: "hidden" } });
    return Response.json({ ok: true });
}


