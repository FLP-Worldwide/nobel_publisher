"use client";
import { useEffect, useState } from "react";

export default function SignedImage({ keyName, fallback = "/fallback.jpg", alt = "", className = "" }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    let aborted = false;

    async function fetchUrl() {
      if (!keyName) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/s3/sign-get-url?key=${encodeURIComponent(keyName)}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
        );
        const json = await res.json().catch(() => ({}));
        if (!aborted && res.ok && json?.url) {
          setUrl(json.url);
        }
      } catch (e) {
        console.error("signed image error:", e);
      }
    }

    fetchUrl();
    return () => { aborted = true; };
  }, [keyName]);

  return (
    <img
      src={url || fallback}
      alt={alt}
      className={className}
      onError={(e) => (e.currentTarget.src = fallback)}
    />
  );
}
