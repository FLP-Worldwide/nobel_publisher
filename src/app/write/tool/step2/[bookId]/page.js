"use client";
import AuthorSidebar from '@/app/components/dashbaord/AuthorSidebar';
import AuthorTopbar from '@/app/components/dashbaord/Topbar';
import React, { useState } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function WriteToolDesign({ params }) {
  const router = useRouter();
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken; // make sure you expose this in NextAuth

  const bookId = params.bookId; // dynamic id from URL

  // alert(params.bookId);
  const [bookSize, setBookSize] = useState("");
  const [bindingType, setBindingType] = useState("");
  const [bookInterior, setBookInterior] = useState("");
  const [paperType, setPaperType] = useState("");
  const [coverLamination, setCoverLamination] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const BookSize = [
    { name: "5 x 8", value: "FIVE_X_EIGHT", detail: "Fiction, Poetry, and Non-Fiction Less than 50,000 words" },
    { name: "5.5 x 8.5", value: "FIVE_HALF_X_EIGHT_HALF", detail: "Fiction, Poetry, and Non-Fiction Less than 50,000 words" },
    { name: "6 x 9", value: "SIX_X_NINE", detail: "Self-help, Biographies, Business and Academic Less than 75,000 words" },
    { name: "8.5 x 8.5", value: "EIGHT_HALF_X_EIGHT_HALF", detail: "Coffee table books, Illustrated Children's books and Cookbooks" },
    { name: "8.5 x 11", value: "EIGHT_HALF_X_ELEVEN", detail: "Academic Books More than 75,000 words" },
  ];

  const BindingType = [
    { name: "Paperback", value: "PAPERBACK" },
    { name: "Hardcase", value: "HARDCOVER" },
  ];

  const BookInterior = [
    { name: "Black & White", value: "BLACK_WHITE", detail: "All Fiction and Non-Fiction books" },
    { name: "Color", value: "COLOR", detail: "Only for Cookbooks, Coffee table and Children's books" },
  ];

  const PaperType = [
    { name: "Cream paper", value: "CREAM", detail: "Recommended for Fiction and Non-Fiction books" },
    { name: "White paper", value: "WHITE", detail: "Recommended for Academic books with images and tables" },
    { name: "Art paper Matte", value: "ART_MATTE", detail: "Recommended for Cookbooks, Coffee table and Children's books" },
  ];

  const BookCoverLamination = [
    { name: "Gloss Finish", value: "GLOSS", detail: "Recommended for darker colored covers and designs with spatial detailing" },
    { name: "Matte Finish", value: "MATTE", detail: "Recommended for lighter colored covers, especially with graphic designs" },
  ];
  const cardClass = (selected) =>
    `flex-1 min-w-[250px] max-w-[300px] border rounded-lg p-4 text-center cursor-pointer transition dark:bg-gray-800  
     ${selected ? "border-blue-500 bg-blue-50 dark:bg-gray-700 dark:text-white" : "border-gray-300 bg-white hover:border-blue-600 "}`;

  // 🔑 Save handler
  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    if (!accessToken) {
      return setMsg("You must be logged in as an author.");
    }
    if (!bookSize || !bindingType || !bookInterior || !paperType || !coverLamination) {
      return setMsg("Please select all required options.");
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/books/${bookId}/design`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            size: bookSize,
            bindingType,
            interior: bookInterior,
            paperType,
            coverLamination,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save design");
      setMsg("✅ Design saved successfully.");
      // redirect to next step (example: upload cover images)
      // router.push(`/author-dashboard/books/${bookId}/upload-cover`);
    } catch (err) {
      setMsg(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  // 🔑 Save handler
  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    if (!accessToken) {
      return setMsg("You must be logged in as an author.");
    }
    if (!bookSize || !bindingType || !bookInterior || !paperType || !coverLamination) {
      return setMsg("Please select all required options.");
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/books/${bookId}/design`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            size: bookSize,
            bindingType,
            interior: bookInterior,
            paperType,
            coverLamination,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save design");
      setMsg("✅ Design saved successfully.");
      // redirect to next step (example: upload cover images)
      // router.push(`/author-dashboard/books/${bookId}/upload-cover`);
    } catch (err) {
      setMsg(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>

      <section className="lg:ml-64">
      <AuthorTopbar />
      <AuthorSidebar currentStep="content" />

      <section className="bg-white dark:bg-gray-900">
        <div className="py-8 px-4 mx-auto max-w-full lg:py-16">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Book Content Design
          </h1>
          <h2 className="mb-6 text-lg text-gray-600 dark:text-gray-300">
            Select your book's specifications, add content and design your cover and interior.
          </h2>

          {msg && (
            <div className="mb-4 p-3 rounded border text-sm 
              ${msg.startsWith('✅') ? 'border-green-300 bg-green-50 text-green-700' : 'border-red-300 bg-red-50 text-red-700'}">
              {msg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              {/* Book Size */}
              <div>
                <label className="block text-lg font-bold mb-2">
                  Book Size <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-4">
                  {BookSize.map((item) => (
                    <label key={item.value} className={cardClass(bookSize === item.value)}>
                      <input
                        type="radio"
                        name="bookSize"
                        value={item.value}
                        checked={bookSize === item.value}
                        onChange={() => setBookSize(item.value)}
                        className="hidden"
                      />
                      <span className="block font-bold text-lg  ">{item.name}</span>
                      <span className="block text-sm ">{item.detail}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Binding Type */}
              <div>
                <label className="block text-lg font-bold mb-2">
                  Binding Type <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-4">
                  {BindingType.map((item) => (
                    <label key={item.value} className={cardClass(bindingType === item.value)}>
                      <input
                        type="radio"
                        name="bindingType"
                        value={item.value}
                        checked={bindingType === item.value}
                        onChange={() => setBindingType(item.value)}
                        className="hidden"
                      />
                      <span className="block font-bold text-lg">{item.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Interior */}
              <div>
                <label className="block text-lg font-bold mb-2">
                  Book Interior <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-4">
                  {BookInterior.map((item) => (
                    <label key={item.value} className={cardClass(bookInterior === item.value)}>
                      <input
                        type="radio"
                        name="bookInterior"
                        value={item.value}
                        checked={bookInterior === item.value}
                        onChange={() => setBookInterior(item.value)}
                        className="hidden"
                      />
                      <span className="block font-bold text-lg">{item.name}</span>
                      <span className="block text-sm ">{item.detail}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Paper Type */}
              <div>
                <label className="block text-lg font-bold mb-2">
                  Paper Type <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-4">
                  {PaperType.map((item) => (
                    <label key={item.value} className={cardClass(paperType === item.value)}>
                      <input
                        type="radio"
                        name="paperType"
                        value={item.value}
                        checked={paperType === item.value}
                        onChange={() => setPaperType(item.value)}
                        className="hidden"
                      />
                      <span className="block font-bold text-lg">{item.name}</span>
                      <span className="block text-sm ">{item.detail}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Cover Lamination */}
              <div>
                <label className="block text-lg font-bold mb-2">
                  Book Cover Lamination <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-4">
                  {BookCoverLamination.map((item) => (
                    <label key={item.value} className={cardClass(coverLamination === item.value)}>
                      <input
                        type="radio"
                        name="coverLamination"
                        value={item.value}
                        checked={coverLamination === item.value}
                        onChange={() => setCoverLamination(item.value)}
                        className="hidden"
                      />
                      <span className="block font-bold text-lg">{item.name}</span>
                      <span className="block text-sm ">{item.detail}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>


            {/* Interior Design */}
                <div className='mt-5'>
                    <label className="block text-lg font-bold text-gray-900 dark:text-white mb-2">
                        Interior Design <span className="text-red-500">*</span>
                    </label>
                
                    <div className="space-y-6">
                        {/* Option 1 - Use Interior Formatting Tool */}
                        <label
                        className={`block border rounded-lg p-6 cursor-pointer transition ${
                            bookInterior === "FormattingTool"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 bg-white hover:border-blue-600"
                        }`}
                        >
                        <input
                            type="radio"
                            name="interiorDesign"
                            value="FormattingTool"
                            checked={bookInterior === "FormattingTool"}
                            onChange={() => setBookInterior("FormattingTool")}
                            className="hidden"
                        />
                        <div>
                            <span className="block font-bold text-lg text-blue-900">
                            Use our Interior Formatting Tool
                            </span>
                            <p className="text-sm text-gray-600 mt-1">
                            Works best for books with text and limited images.
                            </p>

                            <ul className="mt-3 space-y-1 text-sm text-blue-900">
                            <li className="flex items-center gap-2">
                                ✅ Get Published in 2 days
                            </li>
                            <li className="flex items-center gap-2">
                                ✅ Publish Print & eBook
                            </li>
                            <li className="flex items-center gap-2">
                                ✅ Publish in India & sell in 150+ countries
                            </li>
                            </ul>

                            <a href={`/write/tool/step2/${bookId}/canva`}>
                            <button
                            type="button"
                            className="mt-4 px-4 py-2 text-white bg-blue-900 rounded-lg hover:bg-blue-800"
                            >
                            Launch Interior Formatting Tool
                            </button>
                            </a>
                        </div>
                        </label>

                        {/* Option 2 - Upload Print Ready PDF */}
                        {/* <label
                        className={`block border rounded-lg p-6 cursor-pointer transition ${
                            bookInterior === "UploadPDF"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 bg-white hover:border-blue-600"
                        }`}
                        >
                        <input
                            type="radio"
                            name="interiorDesign"
                            value="UploadPDF"
                            checked={bookInterior === "UploadPDF"}
                            onChange={() => setBookInterior("UploadPDF")}
                            className="hidden"
                        />
                        <div>
                            <span className="block font-bold text-lg text-blue-900">
                            Upload Print Ready file in PDF format
                            </span>
                            <p className="text-sm text-gray-600 mt-1">
                            Best if you already have your manuscript formatted.
                            </p>
                        </div>
                        </label> */}
                    </div>
                </div>
                <div className='mt-5'>
                    <label className="block text-lg font-bold text-gray-900 dark:text-white mb-2">
                        Interior Design <span className="text-red-500">*</span>
                    </label>
                
                    <div className="space-y-6">
                        {/* Option 1 - Use Interior Formatting Tool */}
                        <label
                        className={`block border rounded-lg p-6 cursor-pointer transition ${
                            bookInterior === "FormattingTool"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 bg-white hover:border-blue-600"
                        }`}
                        >
                        <input
                            type="radio"
                            name="interiorDesign"
                            value="FormattingTool"
                            checked={bookInterior === "FormattingTool"}
                            onChange={() => setBookInterior("FormattingTool")}
                            className="hidden"
                        />
                        <div>
                            <span className="block font-bold text-lg text-blue-900">
                            Use our Cover Creator
                            </span>
                            <p className="text-sm text-gray-600 mt-1">
                            Start with pre-existing templates, add images and text to create a professional-looking cover for your book without design knowledge.
                            </p>

                          

                            <button
                            type="button"
                            className="mt-4 px-4 py-2 text-white bg-blue-900 rounded-lg hover:bg-blue-800"
                            >
                            Launch Cover Creator Tool
                            </button>
                        </div>
                        </label>
                    </div>
                </div>


            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-5 py-2.5 mt-6 text-sm font-medium text-white bg-blue-900 rounded-lg hover:bg-blue-800 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Saving…" : "Save and Continue"}
            </button>
          </form>
        </div>
      </section>

      </section>
    </>
  );
}
