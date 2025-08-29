"use client";
import { CheckCircle, Trash2 } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

export default function BookCard({
  book,
  onDelete,
  onContinue,
  API_BASE,      // ✅ add this
  accessToken,   // ✅ and this
}) {
  // Prefer id, fallback to _id
  const bookId = book?.id ?? book?._id;

  // Normalize status to uppercase to be safe
  const rawStatus = String(book?.status || "").toUpperCase();

  // Display text (prettified)
  const statusText = rawStatus ? rawStatus.replace(/_/g, " ") : "DRAFT";

  // Tailwind badge styles by status
  const statusBadgeClass = (() => {
    switch (rawStatus) {
      case "PUBLISHED":
        return "bg-green-100 text-green-800";
      case "IN_REVIEW":
        return "bg-amber-100 text-amber-800";
      case "INACTIVE":
        return "bg-gray-200 text-gray-700";
      case "DRAFT":
      default:
        return "bg-blue-100 text-blue-800";
    }
  })();

  // Progress coloring helpers
  const isContentDone = rawStatus === "IN_REVIEW" || rawStatus === "PUBLISHED";
  const isCoverDone = rawStatus === "PUBLISHED";
  const isDistributionDone = rawStatus === "PUBLISHED";

  // 🔐 Signed URL state for private S3 read
  const [signedCoverUrl, setSignedCoverUrl] = useState("");

  // Pick best available cover
  const coverSrc = useMemo(() => {
    return (
      book?.thumbnail ||
      book?.frontCoverUrl ||
      signedCoverUrl ||
      "https://via.placeholder.com/150x200.png?text=No+Cover"
    );
  }, [book?.thumbnail, book?.frontCoverUrl, signedCoverUrl]);

  // If we only have a key, ask backend for a short-lived signed GET URL
  useEffect(() => {
    let aborted = false;

    async function resolveCover() {
      // If we already have a URL, skip
      if (book?.thumbnail || book?.frontCoverUrl) return;

      const key = book?.frontCoverKey;
      if (!key || !API_BASE || !accessToken) return;

      try {
        const res = await fetch(
          `${API_BASE}/s3/sign-get-url?key=${encodeURIComponent(key)}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const json = await res.json().catch(() => ({}));
        if (!aborted && res.ok && json?.url) {
          setSignedCoverUrl(json.url); // short-lived signed URL (e.g., 5 min)
        }
      } catch (e) {
        // fail silently; <img onError> will show fallback
        console.error("cover sign error:", e);
      }
    }

    resolveCover();
    return () => {
      aborted = true;
    };
  }, [book?.thumbnail, book?.frontCoverUrl, book?.frontCoverKey, API_BASE, accessToken]);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-2xl hover:shadow-xl transition p-6 w-full mb-5">
      <div className="flex justify-between items-start gap-4">
        {/* Left: Thumb + Info */}
        <div className="flex  gap-4">
          <div className=" w-20 rounded-lg shadow-sm overflow-hidden bg-gray-100 dark:bg-gray-700">
            <img
              src={coverSrc}
              alt={book?.title ? `${book.title} cover` : "Book cover"}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src =
                  "https://via.placeholder.com/150x200.png?text=No+Cover";
              }}
            />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {book?.title || "Untitled"}
              </h3>

              {/* Status Badge */}
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadgeClass}`}
              >
                {statusText}
              </span>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              {book?.authorName || "Unknown Author"}
            </p>

            <p className="text-sm">
              Language: <span className="font-semibold">{book?.language || "-"}</span>
            </p>


            {book?.pdfUrl && (
              <a
                href={book.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline text-sm font-medium"
              >
                Download PDF
              </a>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {rawStatus !== "PUBLISHED" && (
            <button
              onClick={() => onContinue?.(bookId)}
              className="underline  text-sm font-bold transition cursor-pointer"
            >
              Continue Publishing
            </button>
          )}
          <button
            onClick={() => onDelete?.(bookId)}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            title="Delete book"
            aria-label="Delete book"
          >
            <Trash2 className="w-5 h-5 text-red-500" />
          </button>
        </div>
      </div>

      {/* Progress row */}
      <div className="mt-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-sm text-gray-600 dark:text-gray-300 flex items-center gap-3 flex-wrap">
        
        <CheckCircle className="w-5 h-5 text-green-600" />
        <span className="text-green-600 font-medium">Book Details</span>

        <CheckCircle
          className={`w-5 h-5 ${isContentDone ? "text-green-600" : "text-gray-500"}`}
        />
        <span
          className={`${isContentDone ? "text-green-600" : "text-gray-500"} font-medium`}
        >
          Book Content
        </span>

        <CheckCircle
          className={`w-5 h-5 ${isCoverDone ? "text-green-600" : "text-gray-500"}`}
        />
        <span
          className={`${isCoverDone ? "text-green-600" : "text-gray-500"} font-medium`}
        >
          Book Cover
        </span>

        <CheckCircle
          className={`w-5 h-5 ${
            isDistributionDone ? "text-green-600" : "text-gray-500"
          }`}
        />
        <span
          className={`${
            isDistributionDone ? "text-green-600" : "text-gray-500"
          } font-medium`}
        >
          Book Distribution
        </span>
      </div>
    </div>
  );
}
