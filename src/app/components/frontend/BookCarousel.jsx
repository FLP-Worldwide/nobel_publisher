"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

export default function BookCarousel({heading}) {
  const books = [
    "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400", 
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400", 
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400", 
    "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
    "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400",
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400",
    "https://images.unsplash.com/photo-1473755504818-b72b6dfdc226?w=400",
    "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400"
  ];

  return (
    <div className="px-6 py-6">
         <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {heading}
        </h4>

      <Swiper
        spaceBetween={15}
        slidesPerView={3}
        autoplay={{ delay: 2500 }}
        loop={true}
        modules={[Autoplay]}
        breakpoints={{
          640: { slidesPerView: 3 },
          768: { slidesPerView: 4 },
          1024: { slidesPerView: 6 },
          1280: { slidesPerView: 6 }
        }}
      >
        {books.map((book, index) => (
          <SwiperSlide key={index}>
            <img
              src={book}
              alt={`Book ${index + 1}`}
              className="w-full h-90 object-cover rounded-lg shadow-md hover:scale-105 transition-transform"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
