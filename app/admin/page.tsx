type AdminReview = {
    id: string;
    overall: number;
    text: string;
    instructor: { firstName: string; lastName: string; university: { name: string }; department: { name: string } };
};

async function getPending() {
    const res = await fetch(`${process.env.APP_URL ?? "http://localhost:3000"}/api/admin/moderation?status=pending`, { cache: "no-store" });
    return res.json();
}

export default async function AdminPage() {
    const json = await getPending();
    const items: AdminReview[] = json.data ?? [];
    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            <h1 className="text-2xl font-semibold mb-6">Moderasyon Kuyruğu</h1>
            <ul className="space-y-4">
                {items.map((r) => (
                    <li key={r.id} className="border rounded p-4">
                        <div className="text-sm text-gray-500 mb-2">{r.instructor.university.name} · {r.instructor.department.name}</div>
                        <div className="font-medium">{r.instructor.firstName} {r.instructor.lastName} — Puan: {r.overall}/5</div>
                        <p className="mt-2 text-sm">{r.text}</p>
                        <div className="mt-3 flex gap-2">
                            <form action={`/api/admin/reviews/${r.id}/approve`} method="post"><button className="px-3 py-1 bg-green-600 text-white rounded" type="submit">Onayla</button></form>
                            <form action={`/api/admin/reviews/${r.id}/hide`} method="post"><button className="px-3 py-1 bg-yellow-600 text-white rounded" type="submit">Gizle</button></form>
                            <form action={`/api/admin/reviews/${r.id}/delete`} method="post"><button className="px-3 py-1 bg-red-600 text-white rounded" type="submit">Sil</button></form>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}


