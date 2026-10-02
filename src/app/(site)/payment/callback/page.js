"use client";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle, ShieldAlert } from "lucide-react";

function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const publishingBookId = searchParams.get("publishingBookId");
  const isPublishingReturn = searchParams.get("flow") === "publishing" && /^\d+$/.test(publishingBookId || "");

  useEffect(() => {
    if (isPublishingReturn) {
      // The pricing page asks the API to verify the provider order. A browser
      // return parameter is never treated as proof of payment.
      router.replace(`/write/tool/step2/${publishingBookId}/pricing_info?payment=returned`);
    }
  }, [isPublishingReturn, publishingBookId, router]);

  if (isPublishingReturn) {
    return (
      <main className="grid min-h-[60vh] place-items-center px-4">
        <div className="text-center">
          <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-blue-800" aria-hidden="true" />
          <h1 className="mt-4 text-xl font-bold">Verifying your ₹199 publishing payment</h1>
          <p className="mt-2 text-sm text-slate-600">Keep this page open while the secure status check completes.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="grid min-h-[60vh] place-items-center px-4 py-12">
      <section className="w-full max-w-lg rounded-2xl border border-amber-200 bg-white p-7 text-center shadow-sm">
        <ShieldAlert className="mx-auto h-9 w-9 text-amber-700" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-bold text-slate-950">Payment could not be verified</h1>
        <p className="mt-3 leading-7 text-slate-600">No order was placed from this browser return. Please return to checkout and try again after a secure payment option is available.</p>
        <Link href="/checkout" className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800">
          Return to checkout
        </Link>
      </section>
    </main>
  );
}

export default function PaymentCallback() {
  return (
    <Suspense fallback={<main className="grid min-h-[60vh] place-items-center"><p className="font-semibold">Opening payment status…</p></main>}>
      <PaymentCallbackContent />
    </Suspense>
  );
}
