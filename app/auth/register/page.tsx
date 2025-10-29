"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!email || !password) {
            setError("Email ve şifre gereklidir");
            return;
        }
        if (password.length < 8) {
            setError("Şifre en az 8 karakter olmalıdır");
            return;
        }
        if (password !== confirmPassword) {
            setError("Şifreler eşleşmiyor");
            return;
        }

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Kayıt başarısız");
                return;
            }

            setSuccess(true);

            // Auto-login after registration
            const loginRes = await signIn("credentials", {
                email,
                password,
                redirect: false
            });

            if (loginRes?.ok) {
                // Redirect to home page
                setTimeout(() => router.push("/"), 1500);
            } else {
                // Registration succeeded but login failed - redirect to login page
                setTimeout(() => router.push("/auth/login"), 2000);
            }
        } catch (err) {
            setError("Bir hata oluştu");
        }
    };

    if (success) {
        return (
            <div className="max-w-md mx-auto px-4 py-10">
                <div className="bg-green-50 border border-green-200 rounded p-4">
                    <h2 className="text-lg font-semibold text-green-800 mb-2">Kayıt Başarılı!</h2>
                    <p className="text-green-700">Hesabınız oluşturuldu. Yönlendiriliyorsunuz...</p>
                    {email.endsWith(".edu.tr") && (
                        <p className="text-sm text-green-600 mt-2">
                            ✓ .edu.tr e-posta adresiniz otomatik olarak doğrulandı
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto px-4 py-10">
            <h1 className="text-2xl font-semibold mb-6">Kayıt Ol</h1>
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm mb-1">Email</label>
                    <input
                        type="email"
                        className="w-full border rounded px-3 py-2"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ornek@universite.edu.tr"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                        .edu.tr uzantılı e-postalar otomatik doğrulanır
                    </p>
                </div>
                <div>
                    <label className="block text-sm mb-1">Şifre</label>
                    <input
                        type="password"
                        className="w-full border rounded px-3 py-2"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="En az 8 karakter"
                    />
                </div>
                <div>
                    <label className="block text-sm mb-1">Şifre Tekrar</label>
                    <input
                        type="password"
                        className="w-full border rounded px-3 py-2"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Şifrenizi tekrar girin"
                    />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button className="w-full bg-black text-white rounded px-4 py-2" type="submit">
                    Kayıt Ol
                </button>
            </form>
            <p className="text-sm text-gray-600 mt-4 text-center">
                Zaten hesabınız var mı?{" "}
                <a href="/auth/login" className="text-blue-600 hover:underline">
                    Giriş Yap
                </a>
            </p>
        </div>
    );
}
