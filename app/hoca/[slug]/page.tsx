import Link from "next/link";
import HelpfulVoteButton from "@/app/components/HelpfulVoteButton";

async function getData(slug: string) {
    const res = await fetch(`${process.env.APP_URL ?? "http://localhost:3000"}/api/instructors/${slug}`, { cache: "no-store" });
    return res.json();
}

type TagAgg = { tag: string; _count: { _all: number } };
type ReviewItem = { id: string; overall: number; text: string; helpfulVotes: { id: string }[]; tags: { id: string; tag: string }[] };

export default async function InstructorPage({ params }: { params: { slug: string } }) {
    const json = await getData(params.slug);
    if (!json.ok) return <div className="max-w-4xl mx-auto px-4 py-10">Bulunamadı</div>;
    const { instructor, pagination, reviews, tags } = json.data as {
        instructor: { id: string; firstName: string; lastName: string; overallRating: number; reviewCount: number; slug: string; university: { name: string }; department: { name: string } };
        pagination: { total: number };
        reviews: ReviewItem[];
        tags: TagAgg[];
    };
    return (
        <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">{instructor.firstName} {instructor.lastName}</h1>
                <p className="text-sm text-gray-500">{instructor.university.name} · {instructor.department.name}</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="border rounded p-4">
                    <div className="text-sm text-gray-500">Genel Puan</div>
                    <div className="text-2xl font-semibold">{Number(instructor.overallRating).toFixed(1)}</div>
                </div>
                <div className="border rounded p-4">
                    <div className="text-sm text-gray-500">Değerlendirme</div>
                    <div className="text-2xl font-semibold">{instructor.reviewCount}</div>
                </div>
                <div className="border rounded p-4">
                    <div className="text-sm text-gray-500">Öne çıkan etiketler</div>
                    <div className="mt-2 flex gap-2 flex-wrap">
                        {tags.map((t) => (
                            <span key={t.tag} className="px-2 py-1 bg-gray-100 rounded text-xs">{t.tag} ({t._count._all})</span>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">Değerlendirmeler</h2>
                <Link className="text-blue-600 hover:underline" href={`/hoca/${instructor.slug}/yeni`}>Değerlendirme Yaz</Link>
            </div>
            <ul className="space-y-4">
                {reviews.map((r) => (
                    <li key={r.id} className="border rounded p-4">
                        <div className="flex items-center justify-between">
                            <div className="font-medium">Puan: {r.overall}/5</div>
                            <HelpfulVoteButton reviewId={r.id} initialCount={r.helpfulVotes.length} />
                        </div>
                        <p className="mt-2 text-sm">{r.text}</p>
                        <div className="mt-2 flex gap-2 flex-wrap">
                            {r.tags.map((t) => (
                                <span key={t.id} className="px-2 py-1 bg-gray-100 rounded text-xs">{t.tag}</span>
                            ))}
                        </div>
                    </li>
                ))}
            </ul>
            <div className="text-sm text-gray-500">Toplam {pagination.total} sonuç</div>
        </div>
    );
}
