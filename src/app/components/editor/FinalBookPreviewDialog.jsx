"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { X } from "lucide-react";
import BookPreview from "./BookPreview";

export default function FinalBookPreviewDialog({ book, accessToken, onClose }) {
  return <Dialog open={Boolean(book)} onClose={onClose} className="relative z-[100]">
    <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm" aria-hidden="true" />
    <div className="fixed inset-0 flex items-center justify-center p-0 sm:p-4">
      <DialogPanel className="flex h-[100dvh] w-full max-w-7xl flex-col overflow-hidden bg-[#f5f6f7] shadow-2xl sm:h-[94dvh] sm:rounded-2xl">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <DialogTitle className="text-base font-semibold text-[#19334c]">Final book preview</DialogTitle>
            <p className="truncate text-xs text-slate-500">{book?.title || "Your complete book"} · saved version</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close book preview" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-[#315e54]"><X size={20}/></button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 sm:p-4">
          {book && <BookPreview book={book} accessToken={accessToken}/>}
        </div>
        <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
          <p className="text-xs text-slate-500">Check your covers and pages, then return to submit.</p>
          <button type="button" onClick={onClose} className="ui-button shrink-0" data-autofocus>Back to submission</button>
        </footer>
      </DialogPanel>
    </div>
  </Dialog>;
}
