"use client";
import CoverArtwork from "./cover/CoverArtwork";
import { useEffect, useMemo, useState } from "react";

export default function SignedS3Image({
  coverDesign,
  side = "front",
  s3Key,                 // e.g. book?.frontCoverKey or book?.backCoverKey
  directUrl,             // e.g. book?.frontCoverUrl / thumbnail if you already have it
  accessToken,           // optional; falls back to localStorage
  alt = "",
  className = "",
  fallback = "/cover-fallback.svg",
  refreshMs = 4 * 60 * 1000, // refresh signed URL every ~4min
  apiBase = process.env.NEXT_PUBLIC_API_URL, // ✅ matches your existing code
}) {
  const [url, setUrl] = useState("");
  const base = useMemo(() => (apiBase || "").replace(/\/$/, ""), [apiBase]);

  useEffect(() => {
    if (coverDesign?.[side]) return;
    let stop = false;

    async function resolve() {
      // 1) Prefer a direct URL if provided (thumbnail/frontCoverUrl/backCoverUrl)
      if (directUrl) {
        if (!stop) setUrl(directUrl);
        return;
      }

      // 2) If s3Key is already an absolute URL, just use it
      if (typeof s3Key === "string" && /^(https?:)?\/\//.test(s3Key)) {
        if (!stop) setUrl(s3Key);
        return;
      }

      // 3) Sign S3 key
      if (!s3Key || !base) return;

      try {
        const token =
          accessToken ||
          (typeof window !== "undefined" && localStorage.getItem("accessToken"));

        const res = await fetch(
          `${base}/s3/sign-get-url?key=${encodeURIComponent(s3Key)}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );

        const json = await res.json().catch(() => ({}));
        if (!stop && res.ok && json?.url) setUrl(json.url);
      } catch (e) {
        console.error("SignedS3Image:", e);
      }
    }

    resolve();
    const id = setInterval(resolve, refreshMs);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, [s3Key, directUrl, base, accessToken, refreshMs, coverDesign, side]);

  if (coverDesign?.[side]) return <CoverArtwork design={coverDesign} side={side} alt={alt} className={className}/>;
  return (
    <img
      src={url || fallback}
      alt={alt}
      className={className}
      onError={(event) => {
        if (event.currentTarget.src.endsWith(fallback)) {
          event.currentTarget.onerror = null;
          return;
        }
        event.currentTarget.src = fallback;
      }}
      loading="lazy"
    />
  );
}
