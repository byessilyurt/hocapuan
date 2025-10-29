import { prisma } from "@/app/lib/prisma";
import { containsProhibitedContent } from "@/app/lib/security";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CreateReviewSchema = z.object({
  instructorId: z.string(),
  overall: z.number().min(1).max(5),
  clarity: z.number().min(1).max(5),
  helpfulness: z.number().min(1).max(5),
  workload: z.number().min(1).max(5),
  wouldTakeAgain: z.boolean(),
  courseCode: z.string().max(20).optional().nullable(),
  term: z.string().max(30).optional().nullable(),
  grade: z.string().max(20).optional().nullable(),
  text: z.string().min(50).max(800),
  isAnonymous: z.boolean().optional().default(false),
  tags: z.array(z.string().min(2).max(24)).max(4).optional().default([]),
});

async function userFromRequest() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  return await prisma.user.findUnique({ where: { email: session.user.email } });
}

export async function POST(request: Request) {
  const user = await userFromRequest();
  if (!user) return Response.json({ ok: false, error: "Giriş gerekli" }, { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = CreateReviewSchema.safeParse(json);
  if (!parsed.success) return Response.json({ ok: false, error: "Geçersiz alanlar" }, { status: 400 });
  const data = parsed.data;

  // rate limit: 1 per instructor per 120 days
  const since = new Date(Date.now() - 120 * 24 * 60 * 60 * 1000);
  const last = await prisma.review.findFirst({
    where: { userId: user.id, instructorId: data.instructorId, createdAt: { gte: since } },
  });
  if (last) return Response.json({ ok: false, error: "120 günde bir kez değerlendirebilirsiniz" }, { status: 429 });

  // global cap: 5/day
  const sinceDay = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const dayCount = await prisma.review.count({ where: { userId: user.id, createdAt: { gte: sinceDay } } });
  if (dayCount >= 5) return Response.json({ ok: false, error: "Günlük 5 değerlendirme sınırı" }, { status: 429 });

  const guard = containsProhibitedContent(data.text);
  if (guard) return Response.json({ ok: false, error: guard }, { status: 400 });

  const created = await prisma.review.create({
    data: {
      userId: user.id,
      instructorId: data.instructorId,
      overall: data.overall,
      clarity: data.clarity,
      helpfulness: data.helpfulness,
      workload: data.workload,
      wouldTakeAgain: data.wouldTakeAgain,
      courseCode: data.courseCode ?? undefined,
      term: data.term ?? undefined,
      grade: data.grade ?? undefined,
      text: data.text,
      isAnonymous: data.isAnonymous ?? false,
      status: "pending",
    },
  });

  if (data.tags && data.tags.length) {
    const limited = data.tags.slice(0, 4);
    for (const t of limited) {
      await prisma.reviewTag.create({ data: { reviewId: created.id, tag: t } });
    }
  }

  return Response.json({ ok: true, data: created });
}


