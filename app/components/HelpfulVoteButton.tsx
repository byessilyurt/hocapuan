"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";

interface HelpfulVoteButtonProps {
  reviewId: string;
  initialCount: number;
}

export default function HelpfulVoteButton({ reviewId, initialCount }: HelpfulVoteButtonProps) {
  const { data: session } = useSession();
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [voted, setVoted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVote = async () => {
    if (!session) {
      setError("Oy vermek için giriş yapmalısınız");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (voted) {
      setError("Zaten oy verdiniz");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (res.ok) {
        setCount(count + 1);
        setVoted(true);
      } else {
        setError(data.error || "Bir hata oluştu");
        setTimeout(() => setError(null), 3000);
      }
    } catch {
      setError("Bir hata oluştu");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleVote}
        disabled={loading || voted}
        className={`text-sm px-3 py-1 rounded ${
          voted
            ? "bg-green-100 text-green-700"
            : "text-blue-600 hover:bg-blue-50"
        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        type="button"
      >
        {voted ? "✓ Yararlı" : "Yararlı"} ({count})
      </button>
      {error && (
        <div className="absolute top-full mt-1 left-0 bg-red-100 text-red-700 text-xs px-2 py-1 rounded whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  );
}
