"use client";
import React, { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import AuthorSidebar from "@/app/components/dashbaord/AuthorSidebar";
import AuthorTopbar from "@/app/components/dashbaord/Topbar";
import CoverUploadModal from "@/app/components/CoverUploadModal";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

export default function WriteToolDesign() {
  const [modalOpen, setModalOpen] = useState(false);

  const router = useRouter();
  const params = useParams();
  const bookId = Array.isArray(params?.bookId) ? params.bookId[0] : params?.bookId;

  const { data: session, status } = useSession();
  const accessToken = session?.user?.accessToken;

  // Form state
  const [bookSize, setBookSize] = useState("");
  const [bindingType, setBindingType] = useState("");
  const [bookInterior, setBookInterior] = useState("");
  const [paperType, setPaperType] = useState("");
  const [coverLamination, setCoverLamination] = useState("");

  const [interiorWorkflow, setInteriorWorkflow] = useState("FormattingTool");
  const [coverWorkflow, setCoverWorkflow] = useState("CoverCreator");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [hydrated, setHydrated] = useState(false);

  // ---------- Options ----------
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
     ${selected ? "border-blue-500 bg-blue-50 dark:bg-gray-700 dark:text-white" : "border-gray-300 bg-white hover:border-blue-600"}`;

  // ---------- SWR ----------
  const canFetch = useMemo(
    () => Boolean(API_BASE && bookId && status !== "loading"),
    [API_BASE, bookId, status]
  );

  const swrKey = canFetch ? [`${API_BASE}/books/${bookId}/design`, accessToken] : null;

  const fetcher = async ([url, token]) => {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(txt || `Failed to load design (${res.status})`);
    }
    return res.json();
  };

  const { data, error, isLoading, mutate } = useSWR(swrKey, fetcher, {
    revalidateOnFocus: false,
  });

  // Hydrate form with saved values
  useEffect(() => {
    if (!hydrated && data) {
      setBookSize(data?.size || "");
      setBindingType(data?.bindingType || "");
      setBookInterior(data?.interior || "");
      setPaperType(data?.paperType || "");
      setCoverLamination(data?.coverLamination || "");
      setHydrated(true);
    }
  }, [data, hydrated]);

  // ---------- Save ----------
  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");

    if (!accessToken) return setMsg("❌ You must be logged in as an author.");
    if (!bookSize || !bindingType || !bookInterior || !paperType || !coverLamination)
      return setMsg("❌ Please select all required options.");

    setLoading(true);
    try {
      const payload = { size: bookSize, bindingType, interior: bookInterior, paperType, coverLamination };

      await mutate(
        async () => {
          const res = await fetch(`${API_BASE}/books/${bookId}/design`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload),
          });
          const json = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(json?.message || "Failed to save design");
          return { ...(data || {}), ...payload };
        },
        { revalidate: true }
      );

      setMsg("✅ Design saved successfully.");
      // router.push(`/author-dashboard/books/${bookId}/upload-cover`);
    } catch (err) {
      setMsg(`❌ ${err?.message || "Something went wrong"}`);
    } finally {
      setLoading(false);
    }
  }

  const messageClass = msg
    ? msg.startsWith("✅")
      ? "border-green-300 bg-green-50 text-green-700"
      : "border-red-300 bg-red-50 text-red-700"
    : "";

  return (
    <section className="lg:ml-64">
      <AuthorTopbar />
      <AuthorSidebar currentStep="content" />

      <section className="bg-white dark:bg-gray-900">
        <div className="py-8 px-4 mx-auto max-w-full lg:py-16">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Book Content Design</h1>
          <h2 className="mb-6 text-lg text-gray-600 dark:text-gray-300">
            Select your book's specifications, add content and design your cover and interior.
          </h2>

          {error && <div className="mb-4 p-3 rounded border border-red-300 bg-red-50 text-red-700">{error.message}</div>}
          {msg && <div className={`mb-4 p-3 rounded border text-sm ${messageClass}`}>{msg}</div>}

          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              {/* Book Size */}
              <div>
                <label className="block text-lg font-bold mb-2">Book Size <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-4">
                  {BookSize.map((item) => (
                    <label key={item.value} className={cardClass(bookSize === item.value)}>
                      <input type="radio" name="bookSize" value={item.value} checked={bookSize === item.value} onChange={() => setBookSize(item.value)} className="hidden" />
                      <span className="block font-bold text-lg">{item.name}</span>
                      <span className="block text-sm">{item.detail}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Binding Type */}
              <div>
                <label className="block text-lg font-bold mb-2">Binding Type <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-4">
                  {BindingType.map((item) => (
                    <label key={item.value} className={cardClass(bindingType === item.value)}>
                      <input type="radio" name="bindingType" value={item.value} checked={bindingType === item.value} onChange={() => setBindingType(item.value)} className="hidden" />
                      <span className="block font-bold text-lg">{item.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Interior */}
              <div>
                <label className="block text-lg font-bold mb-2">Book Interior <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-4">
                  {BookInterior.map((item) => (
                    <label key={item.value} className={cardClass(bookInterior === item.value)}>
                      <input type="radio" name="bookInterior" value={item.value} checked={bookInterior === item.value} onChange={() => setBookInterior(item.value)} className="hidden" />
                      <span className="block font-bold text-lg">{item.name}</span>
                      <span className="block text-sm">{item.detail}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Paper Type */}
              <div>
                <label className="block text-lg font-bold mb-2">Paper Type <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-4">
                  {PaperType.map((item) => (
                    <label key={item.value} className={cardClass(paperType === item.value)}>
                      <input type="radio" name="paperType" value={item.value} checked={paperType === item.value} onChange={() => setPaperType(item.value)} className="hidden" />
                      <span className="block font-bold text-lg">{item.name}</span>
                      <span className="block text-sm">{item.detail}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Cover Lamination */}
              <div>
                <label className="block text-lg font-bold mb-2">Book Cover Lamination <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-4">
                  {BookCoverLamination.map((item) => (
                    <label key={item.value} className={cardClass(coverLamination === item.value)}>
                      <input type="radio" name="coverLamination" value={item.value} checked={coverLamination === item.value} onChange={() => setCoverLamination(item.value)} className="hidden" />
                      <span className="block font-bold text-lg">{item.name}</span>
                      <span className="block text-sm">{item.detail}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Save */}
            <button type="submit" disabled={loading || isLoading} className="inline-flex items-center px-5 py-2.5 mt-6 text-sm font-medium text-white bg-blue-900 rounded-lg hover:bg-blue-800 disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? "Saving…" : "Save and Continue"}
            </button>

            {/* Interior Workflow */}
            <div className="mt-8">
              <label className="block text-lg font-bold mb-2">Interior Workflow</label>
              <div className="space-y-6">
                <label className={`block border rounded-lg p-6 cursor-pointer transition ${interiorWorkflow === "FormattingTool" ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white hover:border-blue-600"}`}>
                  <input type="radio" name="interiorWorkflow" value="FormattingTool" checked={interiorWorkflow === "FormattingTool"} onChange={() => setInteriorWorkflow("FormattingTool")} className="hidden" />
                  <div>
                    <span className="block font-bold text-lg text-blue-900">Use our Interior Formatting Tool</span>
                    <p className="text-sm text-gray-600 mt-1">Works best for books with text and limited images.</p>
                    <ul className="mt-3 space-y-1 text-sm text-blue-900">
                      <li>✅ Get Published in 2 days</li>
                      <li>✅ Publish Print & eBook</li>
                      <li>✅ Sell in 150+ countries</li>
                    </ul>
                    <a href={`/write/tool/step2/${bookId}/canva`}>
                      <button type="button" className="mt-4 px-4 py-2 text-white bg-blue-900 rounded-lg hover:bg-blue-800">Launch Interior Formatting Tool</button>
                    </a>
                  </div>
                </label>
              </div>
            </div>

            {/* Cover Workflow */}
            <div className="mt-8">
              <label className="block text-lg font-bold mb-2">Cover Workflow</label>
              <div className="space-y-6">
                <label className={`block border rounded-lg p-6 cursor-pointer transition ${coverWorkflow === "CoverCreator" ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white hover:border-blue-600"}`}>
                  <input type="radio" name="coverWorkflow" value="CoverCreator" checked={coverWorkflow === "CoverCreator"} onChange={() => setCoverWorkflow("CoverCreator")} className="hidden" />
                  <div>
                    <span className="block font-bold text-lg text-blue-900">Use our Cover Creator</span>
                    <p className="text-sm text-gray-600 mt-1">Start with templates, add images and text to create a professional-looking cover.</p>
                    <button onClick={() => setModalOpen(true)} type="button" className="mt-4 px-4 py-2 text-white bg-blue-900 rounded-lg hover:bg-blue-800">Launch Cover Creator Tool</button>
                  </div>
                </label>
              </div>
            </div>
          </form>
        </div>
      </section>
      <CoverUploadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        bookId={bookId}
        accessToken={accessToken}
        API_BASE={API_BASE}
      />
    </section>
  );
}
