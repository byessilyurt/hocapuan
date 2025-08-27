import { prisma } from "@/app/lib/prisma";
import type { Prisma } from "@/app/generated/prisma";
import { z } from "zod";

const QuerySchema = z.object({
  q: z.string().optional(),
  universityId: z.string().optional(),
  departmentId: z.string().optional(),
  minRating: z.coerce.number().min(1).max(5).optional(),
  sort: z.enum(["mostReviewed", "highestRated", "newest"]).optional(),
});

function normalizeTr(input: string): string {
  return input
    .toLocaleLowerCase("tr")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ı", "i")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = QuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) return Response.json({ ok: false, error: "Geçersiz filtre" }, { status: 400 });
  const { q, universityId, departmentId, minRating, sort } = parsed.data;

  const where: Prisma.InstructorWhereInput = {};
  if (universityId) where.universityId = universityId;
  if (departmentId) where.departmentId = departmentId;
  if (minRating) where.overallRating = { gte: minRating };

  // Simple fuzzy: search in normalized name fields
  if (q && q.trim()) {
    const nq = normalizeTr(q.trim());
    where.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { university: { name: { contains: q, mode: "insensitive" } } },
      { department: { name: { contains: q, mode: "insensitive" } } },
      // additionally search slug for normalized match
      { slug: { contains: nq } },
    ];
  }

  const orderBy =
    sort === "highestRated"
      ? [{ overallRating: "desc" as const }, { reviewCount: "desc" as const }]
      : sort === "newest"
        ? [{ createdAt: "desc" as const }]
        : [{ reviewCount: "desc" as const }, { overallRating: "desc" as const }];

  const data = await prisma.instructor.findMany({
    where,
    orderBy,
    include: {
      university: true,
      department: true,
    },
    take: 25,
  });

  return Response.json({ ok: true, data });
}


