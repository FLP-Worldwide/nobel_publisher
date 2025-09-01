"use client";

import BookPreview from "@/app/components/editor/BookPreview";
import { useSession } from "next-auth/react";
import { use, useEffect, useState } from "react";
import Link from "next/link";

export default function PreviewPage(props) {
  const { bookId } = use(props.params);
  const { data: session } = useSession();

  const [previewBook, setPreviewBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const API = process.env.NEXT_PUBLIC_API_URL;

  const authHeaders = (token) => ({
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  // ✅ Normalize API response for BookPreview
  const toPreviewProps = (b) => {
    const chapters = Array.isArray(b?.chapters) ? b.chapters : [];

    const frontmatter = chapters
      .filter((c) =>
        /^(dedication|foreword|preface)$/i.test(c?.title?.trim() || "")
      )
      .map((fm) => ({
        id: fm.id,
        title: fm.title,
        content: fm.content,
        type: "frontmatter",
      }));

    const normalChapters = chapters
      .filter(
        (c) =>
          c?.id &&
          c?.title &&
          c?.content &&
          !/^(back\s*matter|dedication|foreword|preface)$/i.test(
            c.title?.trim() || ""
          )
      )
      .map((ch, idx) => ({
        id: ch.id,
        number: idx + 1,
        title: ch.title,
        content: ch.content,
        type: "chapter",
      }));

    const backmatter = chapters
      .filter((c) => /^(back\s*matter)$/i.test(c?.title?.trim() || ""))
      .map((bm) => ({
        id: bm.id,
        title: bm.title || "Back Matter",
        content: bm.content,
        type: "backmatter",
      }));

    return {
      title: b?.title ?? "",
      subtitle: b?.subheading ?? "",
      author: [b?.authorName, b?.coAuthor].filter(Boolean).join(", "),
      copyright: b?.copyright ?? "",
      frontmatter,
      chapters: normalChapters,
      backmatter,
      _raw: b,
    };
  };

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
        setPreviewBook(toPreviewProps(data));
      } catch (e) {
        if (e?.name !== "AbortError")
          setErr(e?.message || "Error loading book");
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [API, bookId, session?.user?.accessToken]);

  return (
    <div className="min-h-screen bg-gray-700">
      {/* Toolbar */}
      <div className="flex justify-between px-4 py-1">
        <Link href="/write/tool/step2/23/canva/">
          <button className="px-2 font-bold py-2 text-sm text-white rounded shadow hover:underline disabled:opacity-70">
            Close
          </button>
        </Link>
        <Link href={`/write/tool/step2/${bookId}`}>
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
      {!loading && !err && previewBook && <BookPreview book={previewBook} />}
    </div>
  );
}
