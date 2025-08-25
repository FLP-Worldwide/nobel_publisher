"use client";
import AuthorSidebar from '@/app/components/dashbaord/AuthorSidebar'
import AuthorTopbar from '@/app/components/dashbaord/Topbar'
import Topbar from '@/app/components/frontend/Topbar'
import React , {useState}from 'react'

export default function WriteTool() {
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  const languages = [
    { name: "English" },
    { name: "हिंदी" },
    { name: "தமிழ்", beta: false  },
    { name: "മലയാളം", beta: false },
    { name: "বাংলা", beta: false },
    { name: "मराठी", beta: false },
    { name: "ಕನ್ನಡ", beta: false },
    { name: "ગુજરાતી", beta: false },
  ];

  const genre = [
    { name: "Fiction" },
    { name: "Non-Fiction" },
    { name: "Academic"  },
    { name: "Poetry" },
    { name: "Cookbook" },
    { name: "Children Book" },
    { name: "Others" },
  ];

  return (
    <>
      <AuthorTopbar/>
      <AuthorSidebar/>

      <section class="bg-white dark:bg-gray-900">
        <div class="py-8 px-4 mx-auto max-w-5xl lg:py-16">
          <h1>Book Informations</h1>
            <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white">
              Enter all the information about your book - It's language, title and author(s)
            </h2>
            <form action="#">
                <div class="grid gap-4 sm:grid-cols-1 sm:gap-6">
                    <div className="mb-2">
                        <label className="block text-lg font-bold text-gray-900 dark:text-white mb-2">
                        Book Language <span className="text-red-500">*</span>
                        </label>
                        <p className="mb-3 text-gray-600 dark:text-gray-400">
                        Primary language in which your book has been written. In case of bi-lingual or multi-lingual, choose the language that is used the most.
                        </p>

                        <div className="flex flex-wrap gap-3">
                          {languages.map((lang) => (
                            <button
                              type="button"
                              key={lang.name}
                              onClick={() => setSelectedLanguage(lang.name)}
                              className={`relative px-5 py-2 rounded-lg border text-lg font-medium transition 
                                ${
                                  selectedLanguage === lang.name
                                    ? "bg-blue-50 border-blue-500 text-blue-800"
                                    : "bg-white border-gray-300 text-gray-800 hover:bg-gray-100"
                                }`}
                            >
                              {lang.beta && (
                                <span className="absolute -top-2 -left-2 bg-green-100 text-green-700 text-xs px-1 rounded">
                                  Beta
                                </span>
                              )}
                              {lang.name}
                            </button>
                          ))}
                        </div>
                  </div>
                    <div class="sm:col-span-2">
                        <label for="name" class="block  text-lg  font-bold text-gray-900 dark:text-white">Book Title</label>
                        <p className="mb-2">Choose a unique title. You can use amazon.com to check if your title has already been taken.</p>
                        <input type="text" name="name" id="name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" 
                        placeholder="Enter book title" required=""/>
                   </div>
                    <div class="sm:col-span-2">
                        <label for="name" class="block  text-lg  font-bold text-gray-900 dark:text-white">Book Subtitle</label>
                            <p className="mb-2">
                                Subtitle gives more clarity about your book to readers. Recommended for Non-Fiction books
                            </p>
                        <input type="text" name="name" id="name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="Eter book subtitle" required=""/>
                   </div>
                   <div class="sm:col-span-2">
                        <label for="name" class="block  text-lg  font-bold text-gray-900 dark:text-white">Author</label>
                            <p className="mb-2">
                                Author name that would go on the book cover. If you write under Pseudonym, mention that as the author name here.
                            </p>
                        <input type="text" name="name" id="name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" 
                        placeholder="Enter author name" required=""/>
                   </div>
                   <div class="sm:col-span-2">
                      <label for="name" class="block  text-lg  font-bold text-gray-900 dark:text-white">Book Genre</label>
                      <div className="flex flex-wrap gap-3">
                          {genre.map((lang) => (
                            <button
                              type="button"
                              key={lang.name}
                              onClick={() => setSelectedLanguage(lang.name)}
                              className={`relative px-5 py-2 rounded-lg border text-lg font-medium transition 
                                ${
                                  selectedLanguage === lang.name
                                    ? "bg-blue-50 border-blue-500 text-blue-800"
                                    : "bg-white border-gray-300 text-gray-800 hover:bg-gray-100"
                                }`}
                            >
                              {lang.beta && (
                                <span className="absolute -top-2 -left-2 bg-green-100 text-green-700 text-xs px-1 rounded">
                                  Beta
                                </span>
                              )}
                              {lang.name}
                            </button>
                          ))}
                        </div>
                      </div> 
                    
                </div>
                <button type="submit" class="inline-flex items-center px-5 py-2.5 mt-4 sm:mt-6 text-sm font-medium text-center text-white bg-blue-900 rounded-lg focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900 hover:bg-primary-800">
                    Save and continue
                </button>
            </form>
        </div>
      </section>
    </>
  )
}
