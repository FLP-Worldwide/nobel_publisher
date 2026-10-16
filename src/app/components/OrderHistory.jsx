"use client";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import Link from "next/link";
import { apiJson } from "@/utils/checkout";
export default function OrderHistory() {
  const { data: session, status } = useSession();
  const token = session?.user?.accessToken;
  const { data, error } = useSWR(token ? [`${process.env.NEXT_PUBLIC_API_URL}/orders/my`, token] : null, ([url, token]) => apiJson(url, token));
  if (status === "unauthenticated") return <Link href="/login">Sign in to see your orders</Link>;
  if (error) return <p role="alert">{error.message}</p>;
  if (!data) return <p>Loading orders…</p>;
  if (!data.orders?.length) return <p className="ui-help">Your orders will appear here after checkout.</p>;
  return <div className="space-y-5">{data.orders.map(order => <article key={order.id} className="ui-card space-y-3"><div className="flex justify-between"><h2>Order #{order.id}</h2><span className="text-sm">{order.payments?.some(p => p.status === "REFUNDED") ? "Refund recorded" : order.status.replaceAll("_", " ")}</span></div><p className="ui-help">{order.kind === "AUTHOR_COPY" ? "Author copies" : "Retail purchase"} · {new Date(order.createdAt).toLocaleDateString("en-IN")}</p>{order.items.map(item => <p key={item.id}>{item.title || item.book?.title} × {item.qty}</p>)}<p className="font-semibold">₹{Number(order.totalPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })} including delivery</p><p className="text-sm">{order.customerName}, {order.addressLine1}, {order.city} {order.postalCode}</p>{order.trackingNumber && <p className="text-sm">{order.carrier} · {order.trackingNumber}{order.trackingUrl?.startsWith("https://") && <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="ml-3 underline">Track delivery</a>}</p>}{order.status === "PENDING" && <Link className="ui-button ui-button-secondary" href={`/payment/callback?flow=order&orderId=${order.id}`}>Continue payment / check status</Link>}</article>)}</div>;
}
