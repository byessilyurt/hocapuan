import { prisma } from "@/app/lib/prisma";
import type { NextRequest } from "next/server";
import { z } from "zod";

const QuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(50).default(10),
});

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { searchParams } = new URL(request.url);
  const { page, pageSize } = QuerySchema.parse(Object.fromEntries(searchParams));
  const { slug } = await context.params;

  const instructor = await prisma.instructor.findFirst({
    where: { slug },
    include: { university: true, department: true },
  });
  if (!instructor) return Response.json({ ok: false, error: "Bulunamadı" }, { status: 404 });

  const [count, reviews] = await Promise.all([
    prisma.review.count({ where: { instructorId: instructor.id, status: "approved" } }),
    prisma.review.findMany({
      where: { instructorId: instructor.id, status: "approved" },
      orderBy: { createdAt: "desc" },
      include: { tags: true, helpfulVotes: true, user: { select: { id: true, isEduVerified: true } } },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const breakdown = await prisma.review.groupBy({
    by: ["overall"],
    where: { instructorId: instructor.id, status: "approved" },
    _count: { _all: true },
  });

  const tags = await prisma.reviewTag.groupBy({
    by: ["tag"],
    where: { review: { instructorId: instructor.id, status: "approved" } },
    _count: { _all: true },
    orderBy: { _count: { _all: "desc" } },
    take: 10,
  });

  return Response.json({
    ok: true,
    data: {
      instructor,
      pagination: { page, pageSize, total: count },
      reviews,
      breakdown,
      tags,
    },
  });
}


