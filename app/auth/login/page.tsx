"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const res = await signIn("credentials", { email, password, redirect: false });
        if (res?.error) setError("Giriş başarısız");
        if (res?.ok) window.location.href = "/";
    };

    return (
        <div className="max-w-md mx-auto px-4 py-10">
            <h1 className="text-2xl font-semibold mb-6">Giriş Yap</h1>
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm mb-1">Email</label>
                    <input className="w-full border rounded px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm mb-1">Şifre</label>
                    <input type="password" className="w-full border rounded px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button className="w-full bg-black text-white rounded px-4 py-2" type="submit">Giriş</button>
            </form>
            <p className="text-sm text-gray-600 mt-4 text-center">
                Hesabınız yok mu?{" "}
                <a href="/auth/register" className="text-blue-600 hover:underline">
                    Kayıt Ol
                </a>
            </p>
        </div>
    );
}


