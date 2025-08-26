"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AuthorSidebar from "@/app/components/dashbaord/AuthorSidebar";
import AuthorTopbar from "@/app/components/dashbaord/Topbar";

export default function WriteTool() {
  const router = useRouter();
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken; // from your NextAuth callbacks

  // Form state
  const [title, setTitle] = useState("");
  const [subheading, setSubheading] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [coAuthor, setCoAuthor] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const languages = [
    { name: "English" },
    { name: "हिंदी" },
    { name: "தமிழ்" },
    { name: "മലയാളം" },
    { name: "বাংলা" },
    { name: "मराठी" },
    { name: "ಕನ್ನಡ" },
    { name: "ગુજરાતી" },
  ];

  const genres = [
    { name: "Fiction" },
    { name: "Non-Fiction" },
    { name: "Academic" },
    { name: "Poetry" },
    { name: "Cookbook" },
    { name: "Children Book" },
    { name: "Others" },
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Basic validation
    if (!title.trim()) return setError("Book title is required.");
    if (!authorName.trim()) return setError("Author name is required.");
    if (!selectedLanguage) return setError("Please select a language.");
    if (!selectedGenre) return setError("Please select a genre.");

    if (!accessToken) {
      return setError("You must be logged in as an author to create a book.");
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title,
          language: selectedLanguage,
          authorName,
          subheading,
          coAuthor: coAuthor || null,
          genre: selectedGenre,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to create book");
      }

      setSuccess("Book created successfully.");
      // Redirect to the next step (adjust to your route)
      // e.g., take user to the design step for this book:
      router.push(`/write/tool/step2/${data.id}`);
    } catch (err) {
      setError(err.message || "Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>

      <section className="lg:ml-64">
      <AuthorTopbar />
      <AuthorSidebar currentStep="information" />

      <section className="bg-white dark:bg-gray-900">
        <div className="py-8 px-4 mx-auto max-w-full lg:py-16">
          <h1 className="text-2xl font-bold mb-2">Book Informations</h1>
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            Enter all the information about your book - Its language, title and author(s)
          </h2>

          {error && (
            <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-1 sm:gap-6">
              {/* Language */}
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
                        ${selectedLanguage === lang.name
                          ? "bg-blue-50 border-blue-500 text-blue-800"
                          : "bg-white border-gray-300 text-gray-800 hover:bg-gray-100"
                        }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="sm:col-span-2">
                <label htmlFor="title" className="block text-lg font-bold text-gray-900 dark:text-white">
                  Book Title
                </label>
                <p className="mb-2">
                  Choose a unique title. You can use amazon.com to check if your title has already been taken.
                </p>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter book title"
                  required
                />
              </div>

              {/* Subtitle */}
              <div className="sm:col-span-2">
                <label htmlFor="subheading" className="block text-lg font-bold text-gray-900 dark:text-white">
                  Book Subtitle
                </label>
                <p className="mb-2">
                  Subtitle gives more clarity about your book to readers. Recommended for Non-Fiction books
                </p>
                <input
                  type="text"
                  name="subheading"
                  id="subheading"
                  value={subheading}
                  onChange={(e) => setSubheading(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter book subtitle"
                />
              </div>

              {/* Author */}
              <div className="sm:col-span-2">
                <label htmlFor="authorName" className="block text-lg font-bold text-gray-900 dark:text-white">
                  Author
                </label>
                <p className="mb-2">
                  Author name that would go on the book cover. If you write under Pseudonym, mention that as the author name here.
                </p>
                <input
                  type="text"
                  name="authorName"
                  id="authorName"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter author name"
                  required
                />
              </div>

              {/* Co-Author (optional) */}
              <div className="sm:col-span-2">
                <label htmlFor="coAuthor" className="block text-lg font-bold text-gray-900 dark:text-white">
                  Co-Author (optional)
                </label>
                <input
                  type="text"
                  name="coAuthor"
                  id="coAuthor"
                  value={coAuthor}
                  onChange={(e) => setCoAuthor(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter co-author name"
                />
              </div>

              {/* Genre */}
              <div className="sm:col-span-2">
                <label className="block text-lg font-bold text-gray-900 dark:text-white">
                  Book Genre <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-3 mt-2">
                  {genres.map((g) => (
                    <button
                      type="button"
                      key={g.name}
                      onClick={() => setSelectedGenre(g.name)}
                      className={`relative px-5 py-2 rounded-lg border text-lg font-medium transition 
                        ${selectedGenre === g.name
                          ? "bg-blue-50 border-blue-500 text-blue-800"
                          : "bg-white border-gray-300 text-gray-800 hover:bg-gray-100"
                        }`}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-5 py-2.5 mt-4 sm:mt-6 text-sm font-medium text-center text-white bg-blue-900 rounded-lg focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900 hover:bg-blue-800 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save and continue"}
            </button>
          </form>
        </div>
      </section>
      </section>
    </>
  );
}
