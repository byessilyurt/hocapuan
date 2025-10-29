"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type InstructorLite = { id: string; firstName: string; lastName: string };
type FormState = { overall: number; clarity: number; helpfulness: number; workload: number; wouldTakeAgain: boolean; text: string; isAnonymous: boolean };

export default function NewReviewPage({ params }: { params: { slug: string } }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [instructor, setInstructor] = useState<InstructorLite | null>(null);
    const [form, setForm] = useState<FormState>({ overall: 5, clarity: 5, helpfulness: 5, workload: 3, wouldTakeAgain: true, text: "", isAnonymous: true });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
        }
    }, [status, router]);

    useEffect(() => {
        fetch(`/api/instructors/${params.slug}`).then((r) => r.json()).then((j) => setInstructor(j.data?.instructor));
    }, [params.slug]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        if (!instructor) {
            setSubmitting(false);
            setError("Eğitmen yüklenemedi");
            return;
        }
        const res = await fetch(`/api/reviews`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                instructorId: instructor.id,
                ...form,
            }),
        });
        const json = await res.json();
        setSubmitting(false);
        if (!json.ok) setError(json.error ?? "Hata");
        else window.location.href = `/hoca/${params.slug}`;
    };

    if (status === "loading" || !instructor) return <div className="max-w-3xl mx-auto px-4 py-10">Yükleniyor…</div>;
    if (!session) return null;
    return (
        <div className="max-w-3xl mx-auto px-4 py-10">
            <h1 className="text-xl font-semibold mb-4">{instructor.firstName} {instructor.lastName} için Değerlendirme</h1>
            <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    {(["overall", "clarity", "helpfulness", "workload"] as const).map((k) => (
                        <div key={k}>
                            <label className="block text-sm mb-1">{k}</label>
                            <input type="number" min={1} max={5} value={form[k]} onChange={(e) => setForm({ ...form, [k]: Number(e.target.value) })} className="w-full border rounded px-3 py-2" />
                        </div>
                    ))}
                </div>
                <div>
                    <label className="block text-sm mb-1">Tekrar Alır mısın?</label>
                    <select className="border rounded px-3 py-2" value={form.wouldTakeAgain ? "yes" : "no"} onChange={(e) => setForm({ ...form, wouldTakeAgain: e.target.value === "yes" })}>
                        <option value="yes">Evet</option>
                        <option value="no">Hayır</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm mb-1">Metin (50-800)</label>
                    <textarea className="w-full border rounded px-3 py-2" minLength={50} maxLength={800} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
                </div>
                <div className="flex items-center gap-2">
                    <input id="anon" type="checkbox" checked={form.isAnonymous} onChange={(e) => setForm({ ...form, isAnonymous: e.target.checked })} />
                    <label htmlFor="anon">Anonim olarak paylaş</label>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button disabled={submitting} className="bg-black text-white rounded px-4 py-2" type="submit">Gönder</button>
            </form>
        </div>
    );
}


