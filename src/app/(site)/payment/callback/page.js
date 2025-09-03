"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PaymentCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const finalizeOrder = async () => {
      try {
        const status = searchParams.get("status");
        const merchantOrderId = searchParams.get("merchantOrderId");

        console.log("📥 Payment Callback Query Params:", {
          status,
          merchantOrderId,
        });

        // Retrieve stored pending order data
        const pendingOrderRaw = sessionStorage.getItem("pendingOrder");
        if (!pendingOrderRaw) {
          alert("Order session expired. Please try again.");
          router.push("/checkout");
          return;
        }

        const pendingOrder = JSON.parse(pendingOrderRaw);

        if (!pendingOrder?.accessToken) {
          alert("Authentication expired. Please log in again.");
          router.push("/checkout");
          return;
        }

        // ✅ If payment was successful, finalize order
        if (status === "success") {
          console.log("✅ Payment successful, placing order...");

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkout`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${pendingOrder.accessToken}`,
            },
            body: JSON.stringify({
              userId: pendingOrder.userId,
              delivery: {
                name: pendingOrder.formData?.your_name,
                email: pendingOrder.formData?.your_email,
                phone: pendingOrder.formData?.phone,
                addressLine1: pendingOrder.formData?.full_address,
                city: pendingOrder.formData?.city,
                state: pendingOrder.formData?.state,
                postalCode: pendingOrder.formData?.pincode,
                country: pendingOrder.formData?.country,
              },
              paymentMethod: "CARD",
              shippingMethod: "EXPRESS",
              merchantOrderId,
            }),
          });

          const data = await response.json();

          if (response.ok) {
            alert("🎉 Payment successful and order placed!");
            sessionStorage.removeItem("pendingOrder");
            router.push("/orders"); // Redirect to orders page
          } else {
            alert("❌ Failed to place order: " + (data.error || "Unknown error"));
            router.push("/checkout");
          }
        } else {
          // ❌ Payment failed or was canceled
          alert("❌ Payment failed or canceled. Please try again.");
          router.push("/checkout");
        }
      } catch (err) {
        console.error("❌ Error finalizing order:", err);
        alert("Something went wrong while placing your order.");
        router.push("/checkout");
      } finally {
        setLoading(false);
      }
    };

    finalizeOrder();
  }, [searchParams, router]);

  return (
    <div className="flex justify-center items-center h-100">
      {loading ? (
        <p className="text-lg font-semibold">Processing your payment, please wait...</p>
      ) : (
        <p className="text-lg font-semibold">Redirecting...</p>
      )}
    </div>
  );
}
