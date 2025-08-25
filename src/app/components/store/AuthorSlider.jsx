"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

export default function AuthorSlier() {
  const categories = [
    { name: "Solani Chopra", heading:"Actor & Writer", img: "https://img.indiaforums.com/person/640x480/1/2872-saloni-chopra.webp?c=9hM4A5" },
    { name: "Durjoy Dutta", heading:"Writer", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfvNV6BX91yU8qub0nDlymN53yn8sDiB08YA&s" },
    { name: "Divey prakash dubey", heading:"Writer", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQeCJOASGO1aSAdKI-cpATHfEfkNKfedKvTjg&s" },
    { name: "Solani Chopra", heading:"Actor & Writer", img: "https://img.indiaforums.com/person/640x480/1/2872-saloni-chopra.webp?c=9hM4A5" },
    { name: "Durjoy Dutta", heading:"Writer", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfvNV6BX91yU8qub0nDlymN53yn8sDiB08YA&s" },
    { name: "Divey prakash dubey", heading:"Writer", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQeCJOASGO1aSAdKI-cpATHfEfkNKfedKvTjg&s" },
    { name: "Solani Chopra", heading:"Actor & Writer", img: "https://img.indiaforums.com/person/640x480/1/2872-saloni-chopra.webp?c=9hM4A5" },
    { name: "Durjoy Dutta", heading:"Writer", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfvNV6BX91yU8qub0nDlymN53yn8sDiB08YA&s" },
    { name: "Divey prakash dubey", heading:"Writer", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQeCJOASGO1aSAdKI-cpATHfEfkNKfedKvTjg&s" },
    { name: "Divey prakash dubey", heading:"Writer", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQeCJOASGO1aSAdKI-cpATHfEfkNKfedKvTjg&s" },
  ];

  return (
    <div className="px-6 py-6">
      <h4 className="text-2xl font-semibold mb-6">Popular Author</h4>
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
          1280: { slidesPerView: 7 },
        }}
      >
        {categories.map((cat, index) => (
          <SwiperSlide className="flex flex-col items-center justify-center">
          <img
            src={cat.img}
            alt={cat.name}
            className="w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full object-cover border-2 border-gray-200 shadow-md hover:scale-110 transition-transform"
          />
          <p className="mt-3 text-md font-bold md:text-base text-gray-700 text-center">
            {cat.name}
          </p>
          <p className=" text-sm md:text-base font-medium text-gray-700 text-center">
            {cat.heading}
          </p>
        </SwiperSlide>
        
        ))}
      </Swiper>
    </div>
  );
}
