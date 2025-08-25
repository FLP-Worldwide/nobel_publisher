import React from 'react'
import UserHeroSection from '../components/dashbaord/UserHeroSection'

import BookCard from '../components/dashbaord/BookCard';

export default function AuthorDashboard() {
  return (
    <>
        <UserHeroSection/>

        {/* Ads Section */}
        <div className="px-8 mb-4">
          <img src="https://notionpress.com/new-rewamp/images/weekly_contest/IAC_Sep_25/21_IAC_Web_Banner_May_27.webp" />
        </div>
        <div className="mt-8 px-8 mb-4">
          <img className="w-full" src="https://notionpress.com/new-rewamp/images/write_contest/story_dashboard_banner.png" />
        </div>

        <section className="w-full flex justify-center">
          <div className="w-full max-w-6xl px-6">
            {/* Section Heading */}
            <div className="flex items-center gap-5 mb-6">
            <h2 className="text-gray-900 dark:text-white text-2xl md:text-3xl font-extrabold">
              Books
            </h2>
            <a href="/writing/tool">
            <button className="bg-blue-500 text-white px-8 py-3 font-semibold rounded-lg text-lg flex items-center gap-2 shadow-[8px_8px_0px_black] hover:bg-blue-600 transition">
              Start a New Book →
            </button>
            </a>
          </div>

           

            <BookCard/>
            <BookCard/>
          </div>
      </section>
    </>
  )
}
