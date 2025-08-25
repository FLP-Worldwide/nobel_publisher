import React from 'react'

export default function UserHeroSection() {
  return (
    <section className="bg-white dark:bg-gray-900">
    <div className="py-2 px-8 mx-auto lg:py-2">
      <div className="bg-blue-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 md:p-12 mb-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

          <div>

            <h1 className="text-gray-900 dark:text-white text-2xl md:text-3xl font-extrabold mb-2">
              Welcome Kartik Maandothiya.
            </h1>

            <p className="text-lg font-normal text-gray-500 dark:text-gray-400 mb-6">
            Publish, Promote and Manage your books
            </p>
          </div>

          <div className="flex justify-center">
                <div className="bg-blue-100 border border-blue-200 rounded-xl p-6 w-full max-w-lg shadow-md">
                    <div className="flex justify-between items-center">
                    {/* Total Earnings */}
                    <div className="text-left">
                        <h2 className="text-gray-900 dark:text-white text-2xl font-bold">
                        ₹145
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Total Earnings</p>
                    </div>

                    {/* Total Books Sold */}
                    <div className="text-right">
                        <h2 className="text-gray-900 dark:text-white text-2xl font-bold">
                        12
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Total Books Sold</p>
                    </div>
                    </div>
                </div>
            </div>

        </div>

      </div>
    </div>
  </section>
  )
}
