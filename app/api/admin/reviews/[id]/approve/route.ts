import { prisma } from "@/app/lib/prisma";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
    const review = await prisma.review.update({ where: { id: params.id }, data: { status: "approved" } });
    // update aggregates
    const agg = await prisma.review.aggregate({ where: { instructorId: review.instructorId, status: "approved" }, _avg: { overall: true }, _count: { _all: true } });
    await prisma.instructor.update({ where: { id: review.instructorId }, data: { overallRating: agg._avg.overall ?? 0, reviewCount: agg._count._all } });
    return Response.json({ ok: true });
}


