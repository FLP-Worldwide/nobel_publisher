"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

export default function AuthorList() {
  const categories = [
    {
      id: 1,
      name: "William Shakespeare",
      desc: "Legendary playwright and poet. Timeless classics in literature.",
      img: "https://img.freepik.com/free-photo/vintage-typewriter_191095-87711.jpg?w=200"
    },
    {
      id: 2,
      name: "J.K. Rowling",
      desc: "World-famous author of Harry Potter series.",
      img: "https://img.freepik.com/free-photo/open-book-with-bokeh-background_1232-3218.jpg?w=200"
    },
    {
      id: 3,
      name: "Kartik Maandothiya",
      desc: "Brazilian author known for 'The Alchemist'.",
      img: "https://img.freepik.com/free-photo/stack-books_144627-18858.jpg?w=200"
    },
    {
      id: 4,
      name: "Jane Austen",
      desc: "Classic English novelist. Pride and Prejudice fame.",
      img: "https://img.freepik.com/free-photo/book-library-with-open-textbook_1150-5918.jpg?w=200"
    },
    {
      id: 5,
      name: "Jane Austen",
      desc: "Classic English novelist. Pride and Prejudice fame.",
      img: "https://img.freepik.com/free-photo/book-library-with-open-textbook_1150-5918.jpg?w=200"
    }
  ];

  return (
    <div className="px-6 py-6">
        <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Popular Authors
        </h4>
      <Swiper
        spaceBetween={20}
        slidesPerView={2}
        autoplay={{ delay: 2000 }}
        loop={true}
        breakpoints={{
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 }
        }}
      >
        {categories.map((cat) => (
          <SwiperSlide key={cat.id}>
            <a
              href="#"
              className="flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow-sm md:flex-row hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <img
                className="object-cover w-full rounded-t-lg h-32 md:h-32 md:w-24 md:rounded-none md:rounded-s-lg"
                src={cat.img}
                alt={cat.name}
              />
              <div className="flex flex-col justify-between p-3 leading-normal">
                <h5 className="mb-1 text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                  {cat.name}
                </h5>
                <p className="text-sm font-normal text-gray-700 dark:text-gray-400 line-clamp-2">
                  {cat.desc}
                </p>
              </div>
            </a>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
