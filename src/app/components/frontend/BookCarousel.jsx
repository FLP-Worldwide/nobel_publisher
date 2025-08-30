"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL; // e.g. https://api.example.com

export default function BookCarousel({ heading = "Books" }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (!API_BASE) {
        setErr("Missing NEXT_PUBLIC_API_URL");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setErr("");
        const res = await fetch(`${API_BASE}/books/all`, {
          // If your public endpoint is different, e.g. /books/public, change here
          method: "GET",
         
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || `Request failed: ${res.status}`);
        }
        const data = await res.json();
        if (isMounted) setBooks(Array.isArray(data) ? data : []);
      } catch (e) {
        if (isMounted) setErr(e.message || "Failed to load books");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const normalizedBooks = useMemo(() => {
    return (books || []).map((b) => {
      // Try common cover locations; tweak these keys to match your API
      const cover =
        b.cover ||
        b.coverUrl ||
        b.image ||
        b.thumbnail ||
        b?.design?.coverUrl ||
        b?.design?.cover ||
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400";

      const title = b.title || b.name || "Untitled";
      return {
        id: b.id ?? b._id ?? "",
        title,
        cover,
        slug: b.slug, // optional, if you have slugs
      };
    });
  }, [books]);

  return (
    <div className="px-6 py-6 bg-white">
      <h4 className="text-2xl font-bold text-gray-900  mb-4">
        {heading}
      </h4>

      {loading && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="w-full h-40 rounded-lg bg-gray-200  animate-pulse"
            />
          ))}
        </div>
      )}

      {!loading && err && (
        <div className="text-red-600  text-sm">
          {err}
        </div>
      )}

      {!loading && !err && normalizedBooks.length === 0 && (
        <div className="text-gray-600  text-sm">
          No books found.
        </div>
      )}

      {!loading && !err && normalizedBooks.length > 0 && (
        <Swiper
          spaceBetween={15}
          slidesPerView={3}
          autoplay={{ delay: 2500 }}
          loop
          modules={[Autoplay]}
          breakpoints={{
            640: { slidesPerView: 3 },
            768: { slidesPerView: 4 },
            1024: { slidesPerView: 6 },
            1280: { slidesPerView: 6 },
          }}
        >
          {normalizedBooks.map((book, index) => {
            // Build the link. Prefer slug if you have it.
            const href = book.slug ? `/book/${book.slug}` : `/book/${book.id}`;
            return (
              <SwiperSlide key={book.id || index}>
                <Link href={href} className="block">
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-full h-40 md:h-44 object-cover rounded-lg shadow-md hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>
      )}
    </div>
  );
}
