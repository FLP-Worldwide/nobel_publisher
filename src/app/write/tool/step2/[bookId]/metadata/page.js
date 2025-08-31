import AuthorSidebar from '@/app/components/dashbaord/AuthorSidebar'
import AuthorTopbar from '@/app/components/dashbaord/Topbar'
import { CheckCircle } from 'lucide-react'
import React from 'react'

export default function Metadata() {
  return (
    <>
     <section className="lg:ml-64">
      <AuthorTopbar />
      <AuthorSidebar currentStep="metadata" />

      <section className="bg-gray-50  min-h-screen">
        <div className="py-10 px-4 mx-auto max-w-full space-y-10">
          
          {/* Page Title */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900  mb-2">
              Book Blurb and Metadata
            </h1>
            <p className="text-gray-600 ">
              Add your book's blurb and author bio. Select your book's category and submit your book.
            </p>
          </div>

          {/* Book Description */}
          <div className="bg-white  shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900  mb-4">
              Book Description
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="mb-2 text-sm text-gray-600 ">
                  The book description is a marketing pitch that goes on the back cover of your book and on sites like Amazon.
                </p>
                <textarea
                  name="book_description"
                  id="book_description"
                  rows={5}
                  className="border border-gray-300 text-gray-900 text-sm rounded-lg 
                             focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 
                               "
                  placeholder="Write your book description..."
                  required
                ></textarea>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-900   ">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600"/> 
                    Short, compelling and reveal just enough so that the reader would yearn to know more.
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600"/> 
                    Usually written in third-person narrative.
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600"/> 
                    Up to 1,500 characters, including spaces, or about 300 words.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Author Biography */}
          <div className="bg-white  shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900  mb-4">
              Author Biography
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="mb-2 text-sm text-gray-600 ">
                  Just like the book’s description, the author biography is also an essential marketing tool for the book.
                </p>
                <textarea
                  name="author_biography"
                  id="author_biography"
                  rows={5}
                  className="border border-gray-300 text-gray-900 text-sm rounded-lg 
                             focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 
                               "
                  placeholder="Write your biography..."
                  required
                ></textarea>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-900   ">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600"/> 
                    Let your readers know about your background, qualifications.
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600"/> 
                    Explain why you are a credible source of the information.
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600"/> 
                    Up to 2,500 characters, including spaces, or about 450 words.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Keywords */}
          <div className="bg-white  shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900  mb-4">
              Keywords
            </h2>
            <p className="mb-2 text-sm text-gray-600 ">
              Help readers find your book on eCommerce sites and search engines by providing appropriate keywords. Use words that readers might search for.
            </p>
            <input
              type="text"
              name="keywords"
              id="keywords"
              className="border border-gray-300 text-gray-900 text-sm rounded-lg 
                         focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 
                           "
              placeholder="e.g. fantasy, self-help, thriller..."
              required
            />
          </div>

          {/* Terms & Conditions */}
          <div className="bg-white  shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900  mb-4">
              Terms & Conditions
            </h2>
            <ul className="list-disc pl-6 mb-4 text-gray-700  space-y-2 text-sm">
              <li>The WORK is not defamatory, slanderous, libelous, or in any other way illegal...</li>
              <li>The WORK does not contain any illegal, unlawful, or objectionable material...</li>
              <li>All statements in the WORK purporting to be facts are true.</li>
              <li>By submitting this book, I will not be able to make changes until the review is completed.</li>
              <li>It can take up to 2 business days for the book to be reviewed.</li>
            </ul>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="terms"
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                required
              />
              <label htmlFor="terms" className="ml-2 text-gray-900  font-medium">
                I agree
              </label>
            </div>

           

          </div>

           {/* Buttons */}
           <div className="flex gap-4">
            <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                Submit for Review
            </button>
            <button
                type="button"
                className="px-6 py-2 bg-gray-300 text-gray-900 font-medium rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
                Save as Draft
            </button>
            </div>


        </div>
      </section>

      </section>
    </>
  )
}
