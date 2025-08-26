"use client";
import { useEffect } from "react";

export default function PreviewModal({ content, pdfUrl, setPdfUrl, onClose }) {
    useEffect(() => {
        const generatePDF = async () => {
            const html2pdf = (await import("html2pdf.js")).default; // client-only import
            const element = document.createElement("div");
            element.innerHTML = content;

            const opt = {
                margin: [10, 10, 10, 10],
                filename: "document.pdf",
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
            };

            const pdfBlob = await html2pdf().from(element).set(opt).outputPdf("blob");
            setPdfUrl(URL.createObjectURL(pdfBlob));
        };

        generatePDF();
    }, [content, setPdfUrl]);

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
                    <iframe src={pdfUrl} className="w-full h-full border rounded" />
                ) : (
                    <p>Generating PDF...</p>
                )}
            </div>
        </div>
    );
}
