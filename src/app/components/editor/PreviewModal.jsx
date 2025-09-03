"use client";
import { useEffect, useState } from "react";

export default function PreviewModal({
  onClose,
  bookTitle,
  author,
  frontMatter,
  chapters,
  backMatter,
}) {
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    const generatePDF = async () => {
      const pdfMake = (await import("pdfmake/build/pdfmake")).default;
      const pdfFonts = await import("pdfmake/build/vfs_fonts");
      pdfMake.vfs = pdfFonts.default;

      const parseContent = (html) => {
        if (!html) return [];
        return html
          .replace(/<\/p>/gi, "\n\n")
          .replace(/<br\s*\/?>/gi, "\n")
          .replace(/<[^>]+>/g, "")
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0)
          .map((line) => ({
            text: line,
            margin: [0, 0, 0, 10],
          }));
      };

      const numberingOffset = 4; // Cover + Copyright + TOC + Blank

      const docDefinition = {
        info: { title: bookTitle, author: author },
        pageMargins: [40, 60, 40, 60],

        footer: (currentPage, pageCount) => {
          if (currentPage <= numberingOffset) return {};
          return {
            text: `${currentPage - numberingOffset}`,
            alignment: "center",
            margin: [0, 10, 0, 0],
            fontSize: 9,
          };
        },

        content: [
          // Cover
          {
            text: bookTitle,
            style: "title",
            margin: [0, 200, 0, 20],
          },
          { text: `by ${author}`, style: "author", margin: [0, 0, 0, 200] },

          // Front Matter (no TOC entries)
          ...frontMatter.flatMap((ch) => [
            { text: ch.title, style: "chapterTitle", pageBreak: "before" },
            ...parseContent(ch.content),
          ]),

          // Copyright Page
          {
            text: "Copyright © Nobel Publishing House\nAll Rights Reserved",
            style: "chapterTitle",
            pageBreak: "before",
          },
          {
            text: "Made with ❤ on the Nobel Books Platform\nwww.nobelbooks.com",
            alignment: "center",
            margin: [0, 40, 0, 0],
          },

          // ✅ Custom TOC Page (only chapters)
          {
            text: "Contents",
            style: "chapterTitle",
            pageBreak: "before",
          },
          {
            toc: {
              title: { text: "" }, // disable auto title
            },
          },

          // Blank Page
          {
            text: "This page intentionally left blank.",
            italics: true,
            alignment: "center",
            pageBreak: "before",
          },

          // Chapters (TOC entries here)
          ...chapters.flatMap((ch) => [
            {
              text: ch.title,
              style: "chapterTitle",
              pageBreak: "before",
              tocItem: true, // ✅ TOC me dikhayega
            },
            ...parseContent(ch.content),
          ]),

          // Back Matter (no TOC entry, but continue numbering)
          ...backMatter.flatMap((ch) => [
            {
              text: ch.title,
              style: "chapterTitle",
              pageBreak: "before",
            },
            ...parseContent(ch.content),
          ]),
        ],

        styles: {
          title: { fontSize: 28, bold: true, alignment: "center" },
          author: { fontSize: 16, italics: true, alignment: "center" },
          chapterTitle: {
            fontSize: 20,
            bold: true,
            margin: [0, 20, 0, 10],
            alignment: "center",
          },
        },
      };

      const pdfDocGenerator = pdfMake.createPdf(docDefinition);
      pdfDocGenerator.getBlob((blob) => {
        setPdfUrl(URL.createObjectURL(blob));
      });
    };

    generatePDF();
  }, [bookTitle, author, frontMatter, chapters, backMatter]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[80%] h-[80%] relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 px-3 py-1 bg-red-500 text-white rounded"
        >
          ✖
        </button>
        <h2 className="text-xl font-semibold mb-4">📄 PDF Preview</h2>

        {pdfUrl ? (
          <>
            <iframe src={pdfUrl} className="w-full h-full border rounded" />
            <a
              href={pdfUrl}
              download={`${bookTitle.replace(/\s+/g, "_")}.pdf`}
              className="absolute bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
            >
              ⬇ Download PDF
            </a>
          </>
        ) : (
          <p>Generating PDF...</p>
        )}
      </div>
    </div>
  );
}
