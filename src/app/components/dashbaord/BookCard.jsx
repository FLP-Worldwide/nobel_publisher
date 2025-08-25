import React from 'react'
import { Check, CheckCircle, Icon, Trash2 } from "lucide-react"; // delete icon

export default function BookCard() {
  return (
    <>
    {/* Book Card */}
    <div className="bg-white dark:bg-gray-800 border border-gray-300 rounded-2xl  hover:shadow-xl transition p-6 w-full mb-5">
        <div className="flex justify-between items-start">
        {/* Left side: Thumbnail + Info */}
        <div className="flex items-center gap-4">
            {/* Thumbnail */}
            <div className="w-20 h-20 rounded-lg shadow-sm">
            <img src="https://i5.walmartimages.com/seo/The-Boy-Behind-the-Blog-Paperback_96c23ff6-f032-452a-9b14-342b56d12a4f.e9d4d3506a6787f0ca8e630b42ae01c4.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF"/>
            </div>

            {/* Book Info */}
            <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Book Title Here
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Author Name
            </p>
            <a
                href="#"
                className="text-blue-600 hover:underline text-sm font-medium"
            >
                Download PDF
            </a>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
            <button className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                Continue Publishing
            </button>
            <button className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
            <Trash2 className="w-5 h-5 text-red-500" />
            </button>
        </div>
        </div>


        <div className="mt-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-sm text-gray-600 dark:text-gray-300 flex items-center gap-3">
        <p>
            Language: <span className="font-semibold">English</span>
        </p>
            <CheckCircle className="w-5 h-5 text-green-600"/><span className="text-green-600 font-medium">Book Details </span>
            <CheckCircle className="w-5 h-5 text-gray-600"/><span className="text-gray-600 font-medium">Book Content </span>
            <CheckCircle className="w-5 h-5 text-gray-600"/><span className="text-gray-600 font-medium">Book Cover </span>
            <CheckCircle className="w-5 h-5 text-gray-600"/><span className="text-gray-600 font-medium">Book Distribution </span>
        </div>
    </div>
    </>
  )
}
