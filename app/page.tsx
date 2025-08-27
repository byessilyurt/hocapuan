"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = setTimeout(async () => {
      if (!q.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      setResults(json.data ?? []);
      setLoading(false);
    }, 300);
    return () => clearTimeout(id);
  }, [q]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Türkiye'de hoca ve ders değerlendirmeleri</h1>
      <div className="flex items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Üniversite, bölüm veya hoca ara…"
          className="w-full border rounded-md px-4 py-3"
        />
      </div>
      {loading && <p className="mt-4 text-sm">Aranıyor…</p>}
      <ul className="mt-6 space-y-3">
        {results.map((i) => (
          <li key={i.id} className="border rounded p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{i.firstName} {i.lastName}</div>
              <div className="text-sm text-gray-500">{i.university?.name} · {i.department?.name}</div>
            </div>
            <a className="text-blue-600 hover:underline" href={`/hoca/${i.slug}`}>Detaylar</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
