"use client";
import PageShell from "./PageShell";
import { copyrightHtml } from "@/utils/copyright.mjs";
import { sanitizeManuscriptHtml } from "../../../editor/sanitizeHtml";
export default function CopyrightPage({ book = {}, fragment, ...pageProps }) {
  return <PageShell {...pageProps} safeClassName="flex flex-col justify-end"><div className="manuscript-prose book-typeset" style={{fontSize:'9pt',lineHeight:1.5}} dangerouslySetInnerHTML={{ __html: sanitizeManuscriptHtml(fragment ?? (book.importedCopyright || copyrightHtml(book))) }} /></PageShell>;
}
