"use client";
import { useState } from "react";

export default function Page() {
  const [email, setEmail] = useState("");
  const [link, setLink] = useState("");
  const [sent, setSent] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
      <h1 className="text-2xl font-semibold">Kaldırma Talebi</h1>
      <p>Bir içerikle ilgili kaldırma talebiniz varsa lütfen aşağıdaki formu doldurun.</p>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input className="border rounded px-3 py-2 w-full" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Bağlantı</label>
          <input className="border rounded px-3 py-2 w-full" value={link} onChange={(e) => setLink(e.target.value)} />
        </div>
        <button className="bg-black text-white rounded px-4 py-2" type="submit">Gönder</button>
      </form>
      {sent && <p className="text-green-700 text-sm">Talebiniz alınmıştır. En kısa sürede dönüş yapılacaktır.</p>}
    </div>
  );
}


