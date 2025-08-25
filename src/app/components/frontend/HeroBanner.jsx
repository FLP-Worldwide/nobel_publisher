import React from 'react'

export default function HeroBanner() {
  return (
    <>
      <section className="bg-white dark:bg-gray-900">
        <div className="py-2 px-8 mx-auto lg:py-4">
          <div className="bg-cream dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 md:p-12 mb-8">
            
            {/* Grid for text + image */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              
              {/* Left Content */}
              <div>
                <a
                  href="#"
                  className="bg-blue-100 text-blue-800 text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded-md dark:bg-gray-700 dark:text-blue-400 mb-2"
                >
                  <svg
                    className="w-2.5 h-2.5 me-1.5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 14"
                  >
                    <path d="M11 0H2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm8.585 1.189a.994.994 0 0 0-.9-.138l-2.965.983a1 1 0 0 0-.685.949v8a1 1 0 0 0 .675.946l2.965 1.02a1.013 1.013 0 0 0 1.032-.242A1 1 0 0 0 20 12V2a1 1 0 0 0-.415-.811Z"/>
                  </svg>
                  Tutorial
                </a>

                <h1 className="text-gray-900 dark:text-white text-3xl md:text-5xl font-extrabold mb-2">
                  From Writer to Author — We Make It Happen.
                </h1>

                <p className="text-lg font-normal text-gray-500 dark:text-gray-400 mb-6">
                  Nobel Books empowers authors to self-publish with ease — from manuscript to market, 
                  we make publishing simple, professional, and accessible.
                </p>

                <a
                  href="#"
                  className="inline-flex justify-center items-center py-2.5 px-5 text-base font-medium text-center text-white rounded-lg bg-blue-900 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
                >
                  Start Writing
                  <svg
                    className="w-3.5 h-3.5 ms-2 rtl:rotate-180"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 10"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M1 5h12m0 0L9 1m4 4L9 9"
                    />
                  </svg>
                </a>
              </div>

              {/* Right Image */}
              <div className="flex justify-center">
                <img
                  src="https://png.pngtree.com/png-vector/20230811/ourmid/pngtree-cartoon-typewriter-cartoon-symbol-vector-illustration-background-png-image_6842029.png"
                  alt="Vintage Typewriter"
                  className="rounded-lg  w-full max-w-md"
                />
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  )
}
