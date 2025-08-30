"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

export default function CategoryList() {
  const categories = [
    { name: "Fiction", img: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=200" },
    { name: "Science", img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200" },
    { name: "History", img: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200" },
    { name: "Romance", img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200" },
    { name: "Business", img: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=200" },
    { name: "Biographies & Autobiographies", img: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=200" },
    { name: "Mystery", img: "https://images.unsplash.com/photo-1473755504818-b72b6dfdc226?w=200" },
    { name: "Self-help", img: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=200" },
    { name: "Poetry", img: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=200" },
    { name: "Comics", img: "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=200" },
    { name: "Travel", img: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=200" },
    { name: "Cooking", img: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200" }
  ];

  return (
    <div className="px-6 py-6 bg-white">
      <h4 className="text-2xl font-semibold mb-6">Browse Categories</h4>
      <Swiper
        spaceBetween={10}
        slidesPerView={4}
        autoplay={{ delay: 2000 }}
        loop={true}
        modules={[Autoplay]}
        breakpoints={{
          640: { slidesPerView: 4 },
          768: { slidesPerView: 6 },
          1024: { slidesPerView: 8 },
          1280: { slidesPerView: 9 },
        }}
      >
        {categories.map((cat, index) => (
          <SwiperSlide className="flex flex-col items-center justify-center bg-white">
            <a href="/search">
              <img
                src={cat.img}
                alt={cat.name}
                className="w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full object-cover border-2 border-gray-200 shadow-md hover:scale-110 transition-transform"
              />
            </a>
          <p className="mt-3 text-sm md:text-base font-medium text-gray-700 text-center">
            {cat.name}
          </p>
        </SwiperSlide>
        
        ))}
      </Swiper>
    </div>
  );
}
