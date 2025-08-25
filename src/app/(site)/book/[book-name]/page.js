"use client";
import Breadcrumb from '@/app/components/Breadcrumb'
import BookCarousel from '@/app/components/frontend/BookCarousel';
import React, { useState } from 'react'

export default function Book() {

  const [expanded, setExpanded] = useState(false);

  const toggleDescription = () => {
    setExpanded(!expanded);
  };
  
  return (
    <>
      <div class="max-w-full px-4">
        <Breadcrumb />
        <section class="py-8 bg-white md:py-16 dark:bg-gray-900 antialiased">
          <div class=" px-4 mx-auto">
            <div class="lg:grid lg:grid-cols-12 lg:gap-8 xl:gap-16">


              <div class="lg:col-span-4 shrink-0 max-w-md lg:max-w-lg mx-auto">
                <img class="w-full dark:hidden" src="https://i5.walmartimages.com/seo/The-Boy-Behind-the-Blog-Paperback_96c23ff6-f032-452a-9b14-342b56d12a4f.e9d4d3506a6787f0ca8e630b42ae01c4.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF" alt="Light Mode iMac" />
              </div>


              <div class="mt-6 sm:mt-8 lg:mt-0 lg:col-span-5">
                <h1 class="text-xl font-semibold text-gray-900 sm:text-4xl dark:text-white">
                  The Macro Faire
                </h1>
                <p>An Investor's Guide To Macroeconomics
                </p>

                <div class="mt-4 sm:items-center sm:gap-4 sm:flex">

                  <div class="flex items-center gap-2">
                    <div class="flex items-center gap-1 text-yellow-300">
                      <svg class="w-4 h-4 text-yellow-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" > <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z" /> </svg> <svg class="w-4 h-4 text-yellow-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" > <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z" /> </svg> <svg class="w-4 h-4 text-yellow-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" > <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z" /> </svg> <svg class="w-4 h-4 text-yellow-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" > <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z" /> </svg> <svg class="w-4 h-4 text-yellow-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" > <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z" /> </svg>
                    </div>
                    <p class="text-sm font-medium text-gray-500 dark:text-gray-400">(5.0)</p>
                    <a href="#" class="text-sm font-medium text-gray-900 underline hover:no-underline dark:text-white">345 Reviews</a>
                  </div>
                </div>

                <hr class="my-6 md:my-8 border-gray-200 dark:border-gray-800" />

                <p id="description"
                  className={`text-gray-700 transition-all duration-300 ${
                    expanded ? "line-clamp-none" : "line-clamp-4"
                  }`}>
                  “Crude prices to surge to USD 300 a barrel”, “Rupee to slide further”, “World Bank cuts India’s GDP forecast”: these news headlines are just the tip of the iceberg. How the markets react to the macroeconomic environment is heavily news-driven, given that the same data can be interpreted in several ways. To complicate things further, investors today have an overwhelming array of choices at every level, including asset classes, geography, investment horizons, and reasons to invest! ‘The Macro Faire’, your DIY kit to top-down investing, aims to help build an understanding of macro data starting from the very basics. It will equip you with a set of tools that will let you interpret data in all market conditions and make better investing decisions. If you’ve been putting off diving deeper into macroeconomics because you believe it’s too complex, this is just the book you need to get you over the hump, one chapter at a time! 
                </p>

                <button
                   id="toggleBtn"
                  onClick={toggleDescription}
                  className="mt-3 text-primary hover:underline font-medium"
                >
                  {expanded ? "Read Less" : "Read More"}
                </button>


                <div class="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
                  <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Also Available On
                  </h2>
                  <div class="flex items-center space-x-6 mb-8">
                    <a href="#">
                      Buy on Amazon Kinddle Book
                    </a>
                    <a href="#">
                    Buy on Flipkart
                    </a>
                    <a href="#">
                    Buy on Amazon
                    </a>
                  </div>
                  <div class="border-t border-gray-200 dark:border-gray-700 pt-8">
                    <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                      Ratings & Reviews
                    </h2>

                    <div class="flex items-center mb-6">
                      <span class="text-4xl font-bold text-gray-900 dark:text-white">4.5</span>
                      <div class="ml-3">
                        <div class="flex items-center">
                          <svg class="w-4 h-4 text-yellow-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" > <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z" /> </svg> <svg class="w-4 h-4 text-yellow-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" > <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z" /> </svg> <svg class="w-4 h-4 text-yellow-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" > <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z" /> </svg> <svg class="w-4 h-4 text-yellow-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" > <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z" /> </svg> <svg class="w-4 h-4 text-yellow-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" > <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z" /> </svg>
                        </div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Based on 1,234 reviews</p>
                      </div>
                    </div>


                  </div>
                </div>


              </div>


              <div class="mt-6 sm:mt-8 lg:mt-0 lg:col-span-3  ">
                <div class="border-2 rounded-md border-gray-200 p-4 flex flex-col items-start">
                  <p class="text-2xl font-extrabold text-gray-900 sm:text-3xl dark:text-white">$1,249.99</p>

                  <div class="mt-6 flex flex-col gap-4 w-full">
                    <a href="#" class="flex items-center justify-center py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-white">
                      Add to Favorites
                    </a>

                    <a href="#" class="text-white mt-4 sm:mt-0 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 flex items-center justify-center" role="button"  >
                      <svg class="w-5 h-5 -ms-2 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" > <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4h1.5L8 16m0 0h8m-8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm.75-3H7.5M11 7H6.312M17 4v6m-3-3h6" /> </svg>
                      Buy Now
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>

          
          <div class=" mx-auto p-6 bg-white border border-gray-200 rounded-lg shadow-sm md:grid md:grid-cols-6 gap-8">
  

              <div class="flex justify-center md:col-span-1">
                <img class="w-40 h-40 rounded-full object-cover" 
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQf85Mvi1uopaEpb5ZeoCaT0lDT90XN_Z8bg&s" 
                    alt="Profile photo"/>
              </div>


              <div class="md:col-span-5 flex flex-col justify-center">
                <h2 class="text-2xl font-bold text-gray-900">Kartik Maandothiya</h2>
                <p class="mt-2 text-gray-600">
                  I’m Kartik Mandothiya, Delhi is my birth town and little we know it is bordered by the state of Haryana on three sides and by Uttar Pradesh to the east. 
                  For this reason, sometimes you will get a touch of the local language of Delhi as included little Bihari, Haryanvi or maybe Bhojpuri.
                </p>
                <p class="mt-2 text-gray-600">
                  I love fashion, movies, music, Designs, food and even more better Chai rather than Coffee.
                </p>
                <a href="#" class="mt-2 text-red-500 hover:underline">Read More...</a>


                <h3 class="mt-6 text-lg font-semibold text-gray-900">Achievements</h3>
                <div class="flex items-center space-x-4 mt-3">
                  <img src="https://i.pinimg.com/1200x/4d/87/36/4d87367ae22dc29bdbcf38f827c5c629.jpg" alt="badge" class="w-12 h-12 rounded-full"/>
                  <img src="https://i.pinimg.com/1200x/4d/87/36/4d87367ae22dc29bdbcf38f827c5c629.jpg" alt="badge" class="w-12 h-12 rounded-full"/>
                  <img src="https://i.pinimg.com/1200x/4d/87/36/4d87367ae22dc29bdbcf38f827c5c629.jpg" alt="badge" class="w-12 h-12 rounded-full"/>
                  <a href="#" class="text-red-500 hover:underline">View All</a>
                </div>
              </div>
            </div>


            <BookCarousel heading={"Similer Book"}/>  
        </section>

        
      </div>
    </>
  )

}
