"use client";

import { ChevronDown, ChevronUp, Loader2, PackageCheck, Truck } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

async function readJson(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.message || `Request failed (${response.status})`);
  return body;
}

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default function AuthorCopyOrder({ bookId, apiBase, authHeaders, user }) {
  const [quantity, setQuantity] = useState(1);
  const [shippingMethod, setShippingMethod] = useState("STANDARD");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [message, setMessage] = useState(null);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [delivery, setDelivery] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  useEffect(() => {
    setDelivery((current) => ({
      ...current,
      name: current.name || user?.name || "",
      email: current.email || user?.email || "",
    }));
  }, [user?.email, user?.name]);

  const loadQuote = useCallback(async () => {
    const parsedQuantity = Number(quantity);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1 || parsedQuantity > 100) {
      setQuote(null);
      setQuoteLoading(false);
      return;
    }

    setQuoteLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`${apiBase}/books/${bookId}/author-copies/quote`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ quantity: parsedQuantity, shippingMethod }),
      });
      const result = await readJson(response);
      setQuote(result.quote);
    } catch (error) {
      setQuote(null);
      setMessage({ type: "error", text: error.message || "Could not calculate the author-copy price." });
    } finally {
      setQuoteLoading(false);
    }
  }, [apiBase, authHeaders, bookId, quantity, shippingMethod]);

  useEffect(() => {
    const timer = window.setTimeout(loadQuote, 300);
    return () => window.clearTimeout(timer);
  }, [loadQuote]);

  function updateDelivery(event) {
    const { name, value } = event.target;
    setDelivery((current) => ({ ...current, [name]: value }));
  }

  async function createOrder(event) {
    event.preventDefault();
    setOrdering(true);
    setMessage(null);
    try {
      const response = await fetch(`${apiBase}/books/${bookId}/author-copies/orders`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          quantity: Number(quantity),
          shippingMethod,
          paymentMethod,
          delivery,
        }),
      });
      const result = await readJson(response);
      setCreatedOrder(result.order);
      setQuote(result.quote || quote);
      setMessage({
        type: "success",
        text: result.message || "Your author-copy order was created and is awaiting payment confirmation.",
      });
      setDetailsOpen(false);
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Could not create the author-copy order." });
    } finally {
      setOrdering(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="author-copies-heading">
      <div className="p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
              <PackageCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-700">For published books</p>
              <h2 id="author-copies-heading" className="mt-1 text-xl font-bold text-slate-950">Order author copies</h2>
              <p className="mt-1 max-w-xl text-sm leading-6 text-slate-600">
                Choose a quantity and delivery speed. Printing and delivery prices are calculated by the server from your saved book format.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="copy-quantity" className="mb-2 block text-sm font-bold text-slate-800">Number of copies</label>
            <input
              id="copy-quantity"
              type="number"
              inputMode="numeric"
              min="1"
              max="100"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              className="min-h-12 w-full rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            />
            <p className="mt-1.5 text-xs text-slate-500">1–100 copies per order</p>
          </div>
          <fieldset>
            <legend className="mb-2 block text-sm font-bold text-slate-800">Delivery speed</legend>
            <div className="grid grid-cols-2 gap-2">
              {[{ value: "STANDARD", label: "Standard" }, { value: "EXPRESS", label: "Express" }].map((option) => (
                <label
                  key={option.value}
                  className={`flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition ${
                    shippingMethod === option.value
                      ? "border-blue-700 bg-blue-50 text-blue-800"
                      : "border-slate-300 bg-white text-slate-700 hover:border-blue-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="shippingMethod"
                    value={option.value}
                    checked={shippingMethod === option.value}
                    onChange={(event) => setShippingMethod(event.target.value)}
                    className="sr-only"
                  />
                  <Truck className="h-4 w-4" aria-hidden="true" />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          {quoteLoading ? (
            <div className="flex min-h-20 items-center justify-center text-sm font-medium text-slate-600">
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-700" aria-hidden="true" />
              Calculating your price…
            </div>
          ) : quote ? (
            <div>
              <dl className="grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-slate-500">Printing</dt>
                  <dd className="mt-1 font-bold text-slate-900">{money(quote.unitPrice)} × {quote.quantity}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Delivery</dt>
                  <dd className="mt-1 font-bold text-slate-900">{money(quote.shippingCharge)}</dd>
                </div>
                <div className="sm:text-right">
                  <dt className="text-slate-500">Order total</dt>
                  <dd className="mt-1 text-xl font-bold text-slate-950">{money(quote.total)}</dd>
                </div>
              </dl>
              <p className="mt-3 border-t border-slate-200 pt-3 text-xs leading-5 text-slate-500">
                This quote is based on your current trim size, binding, interior, quantity, and delivery method.
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-600">Enter a quantity from 1 to 100 to see the price.</p>
          )}
        </div>

        {message && (
          <div
            role={message.type === "error" ? "alert" : "status"}
            className={`mt-5 rounded-xl border px-4 py-3 text-sm font-medium ${
              message.type === "error"
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            {message.text}
            {createdOrder && (
              <Link href="/author-dashboard/order" className="ml-2 font-bold underline underline-offset-2">
                View orders
              </Link>
            )}
          </div>
        )}

        {!createdOrder && (
          <button
            type="button"
            onClick={() => setDetailsOpen((value) => !value)}
            disabled={!quote || quoteLoading}
            aria-expanded={detailsOpen}
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-violet-800 focus:outline-none focus:ring-4 focus:ring-violet-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {detailsOpen ? "Hide delivery details" : "Continue with this quote"}
            {detailsOpen ? <ChevronUp className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
          </button>
        )}
      </div>

      {detailsOpen && !createdOrder && (
        <form onSubmit={createOrder} className="border-t border-slate-200 bg-slate-50 p-5 sm:p-7">
          <h3 className="text-lg font-bold text-slate-950">Delivery and payment preference</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            The order will remain pending until payment is verified. Creating it does not charge you.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              { name: "name", label: "Full name", type: "text", autoComplete: "name" },
              { name: "email", label: "Email", type: "email", autoComplete: "email" },
              { name: "phone", label: "Phone number", type: "tel", autoComplete: "tel" },
              { name: "postalCode", label: "PIN code", type: "text", autoComplete: "postal-code" },
            ].map((field) => (
              <label key={field.name} className="block text-sm font-bold text-slate-800">
                {field.label}
                <input
                  name={field.name}
                  type={field.type}
                  autoComplete={field.autoComplete}
                  value={delivery[field.name]}
                  onChange={updateDelivery}
                  required
                  className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />
              </label>
            ))}

            <label className="block text-sm font-bold text-slate-800 sm:col-span-2">
              Address
              <input
                name="addressLine1"
                type="text"
                autoComplete="address-line1"
                value={delivery.addressLine1}
                onChange={updateDelivery}
                required
                className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
            </label>
            <label className="block text-sm font-bold text-slate-800 sm:col-span-2">
              Address line 2 <span className="font-normal text-slate-500">(optional)</span>
              <input
                name="addressLine2"
                type="text"
                autoComplete="address-line2"
                value={delivery.addressLine2}
                onChange={updateDelivery}
                className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
            </label>
            {[
              { name: "city", label: "City", autoComplete: "address-level2" },
              { name: "state", label: "State", autoComplete: "address-level1" },
              { name: "country", label: "Country", autoComplete: "country-name" },
            ].map((field) => (
              <label key={field.name} className="block text-sm font-bold text-slate-800">
                {field.label}
                <input
                  name={field.name}
                  type="text"
                  autoComplete={field.autoComplete}
                  value={delivery[field.name]}
                  onChange={updateDelivery}
                  required
                  className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />
              </label>
            ))}
            <fieldset className="sm:col-span-2">
              <legend className="text-sm font-bold text-slate-800">Preferred payment method</legend>
              <div className="mt-2 flex gap-2">
                {[{ value: "UPI", label: "UPI" }, { value: "CARD", label: "Card" }].map((option) => (
                  <label
                    key={option.value}
                    className={`flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-xl border px-4 py-2 text-sm font-bold ${
                      paymentMethod === option.value
                        ? "border-blue-700 bg-blue-50 text-blue-800"
                        : "border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={option.value}
                      checked={paymentMethod === option.value}
                      onChange={(event) => setPaymentMethod(event.target.value)}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <button
            type="submit"
            disabled={ordering}
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-6 py-3 text-base font-bold text-white transition hover:bg-violet-800 focus:outline-none focus:ring-4 focus:ring-violet-200 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {ordering && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
            {ordering ? "Creating order…" : `Create pending order · ${money(quote?.total)}`}
          </button>
        </form>
      )}
    </section>
  );
}
