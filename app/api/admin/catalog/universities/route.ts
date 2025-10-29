import { prisma } from "@/app/lib/prisma";
import { requireAdmin, unauthorizedResponse } from "@/app/lib/auth-helpers";
import { z } from "zod";

const Body = z.object({ name: z.string().min(2), city: z.string().optional() });

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
    const admin = await requireAdmin();
    if (!admin) return unauthorizedResponse();

    const data = await prisma.university.findMany({ orderBy: { name: "asc" } });
    return Response.json({ ok: true, data });
}

export async function POST(request: Request) {
    const admin = await requireAdmin();
    if (!admin) return unauthorizedResponse();

    const json = await request.json().catch(() => null);
    const parsed = Body.safeParse(json);
    if (!parsed.success) return Response.json({ ok: false, error: "Geçersiz" }, { status: 400 });
    const slug = parsed.data.name.toLocaleLowerCase("tr").replace(/\s+/g, "-");
    const uni = await prisma.university.create({ data: { name: parsed.data.name, city: parsed.data.city, slug } });
    return Response.json({ ok: true, data: uni });
}


