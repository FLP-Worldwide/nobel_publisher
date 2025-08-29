"use client";

import BookPreview from "@/app/components/editor/BookPreview";
import { useSession } from "next-auth/react";
import { use, useEffect, useState } from "react";
import Link from "next/link";

export default function PreviewPage(props) {
  // 1) Unwrap promised params (Next.js App Router)
  const { bookId } = use(props.params);

  // 2) Auth session (NextAuth)
  const { data: session } = useSession();

  // 3) Local state
  const [previewBook, setPreviewBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // 4) Helpers
  const API = process.env.NEXT_PUBLIC_API_URL;

  const authHeaders = (token) => ({
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  // Convert your API response → BookPreview props (keeping HTML/content as-is)
  const toPreviewProps = (b) => {
    const chapters = Array.isArray(b?.chapters) ? b.chapters : [];

    const backMatterChapter = chapters.find((c) =>
      /^(back\s*matter)$/i.test(c?.title?.trim() || "")
    );

    const normalChapters = chapters
      .filter((c) => c?.id && c?.title && c?.content)
      .filter((c) => !/^(back\s*matter)$/i.test(c.title?.trim() || ""))
      .map((c) => ({
        id: c.id,
        title: c.title,
        content: c.content, // HTML string preserved
        type: c.type,       // kept in case your component uses it
      }));

    return {
      title: b?.title ?? "",
      subtitle: b?.subheading ?? "",
      author: [b?.authorName, b?.coAuthor].filter(Boolean).join(", "),
      // If you have a copyright field in API later, map it here.
      copyright: b?.copyright ?? "",
      chapters: normalChapters,
      backmatter: backMatterChapter?.content ?? "",
      // Anything extra you want to forward (optional):
      _raw: b, // keeps full original payload available if BookPreview needs more
    };
  };

  // 5) Fetch on mount/changes
  useEffect(() => {
    if (!API || !bookId) return;

    const controller = new AbortController();

    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch(`${API}/books/${bookId}`, {
          method: "GET",
          headers: authHeaders(session?.user?.accessToken),
          signal: controller.signal,
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Fetch failed ${res.status}: ${text}`);
        }

        const data = await res.json();
        // data is your object:
        // { id, userId, title, language, authorName, coAuthor, chapters: [...], design: {...}, ... }
        setPreviewBook(toPreviewProps(data));
      } catch (e) {
        if (e?.name !== "AbortError") setErr(e?.message || "Error loading book");
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [API, bookId, session?.user?.accessToken]);

  return (
    <div className="min-h-screen bg-gray-700">
      <div className="flex justify-between px-4 py-1">
        <Link href="/write/tool/step2/23/canva/">
          <button className="px-2 font-bold py-2 text-sm text-white rounded shadow hover:underline disabled:opacity-70">
            Close
          </button>
        </Link>
        <Link href="/write/tool/step2/23">
          <button className="px-2 font-bold py-2 text-sm text-white rounded shadow hover:underline disabled:opacity-70">
            Save and Continue
          </button>
        </Link>
      </div>

      {loading && (
        <div className="px-4 py-6 text-white/80">Loading preview…</div>
      )}

      {err && (
        <div className="px-4 py-6 text-red-300">
          Failed to load book: {err}
        </div>
      )}

      {!loading && !err && previewBook && (
        <BookPreview book={previewBook} />
      )}
    </div>
  );
}
