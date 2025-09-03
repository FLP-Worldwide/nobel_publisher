"use client";
import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  ChevronDown,
  Phone,
  Mail,
  User,
  Globe,
  MapPin,
} from "lucide-react";
import { useSession } from "next-auth/react";

export default function Checkout() {
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;

  const [cart, setCart] = useState({
    subtotal: 0,
    savings: 0,
    storePickup: 0,
    tax: 0,
    total: 0,
  });

  const [formData, setFormData] = useState({
    your_name: "",
    your_email: "",
    phone: "",
    country: "IN",
    state: "",
    city: "",
    full_address: "",
    pincode: "",
    paymentMethod: "credit-card",
    deliveryMethod: "dhl",
    voucher: "",
  });
// Handle input changes
const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };
  
  const handleRadioChange = (e) => {
    const { name, id } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: id,
    }));
  };
  
  
  // Step 1: Initiate PhonePe Payment
const initiatePayment = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/phonepe/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`, // Send token if user is logged in
        },
        body: JSON.stringify({
          amount: cart.total * 100, // Convert to paise for PhonePe
          redirectUrl: `${window.location.origin}/payment/callback`,
        }),
      });
  
      console.log("Raw fetch response:", response);
  
      // ✅ Parse the JSON body
      const data = await response.json();
      console.log("Parsed JSON response:", data);
  
      // ✅ Use the parsed data
      if (data.success && data.redirectUrl) {
        window.location.href = data.redirectUrl; // Redirect to PhonePe
      } else {
        alert(`Payment initiation failed: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Payment initiation error:", err);
    }
  };
  

  
  // Step 2: Place Order After Successful Payment
  const placeOrder = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          userId: session?.user?.id,
          delivery: {
            name: formData.your_name,
            email: formData.your_email,
            phone: formData.phone,
            addressLine1: formData.full_address,
            city: formData.city,
            state: formData.state,
            postalCode: formData.pincode,
            country: formData.country,
          },
          paymentMethod: formData.paymentMethod === "credit-card" ? "CARD" : "COD",
          shippingMethod: formData.deliveryMethod === "dhl" ? "EXPRESS" : "STANDARD",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Order placed successfully!");
        console.log("✅ Order created:", data);
        sessionStorage.removeItem("pendingOrder");
      } else {
        alert("Failed to place order: " + data.error);
      }
    } catch (err) {
      console.error("❌ Error placing order:", err);
    }
  };

  // Step 3: Detect callback from PhonePe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const merchantOrderId = params.get("merchantOrderId");

    // If coming back from PhonePe after payment
    if (status && merchantOrderId) {
      const pendingOrder = sessionStorage.getItem("pendingOrder");

      if (status === "success" && pendingOrder) {
        placeOrder();
      } else if (status === "failure") {
        alert("Payment failed. Please try again.");
      }
    }
  }, []);

  // Load cart items
  useEffect(() => {
    const loadCart = async () => {
      try {
        let items = [];

        if (accessToken) {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (res.ok) {
            const data = await res.json();
            items = data.items || [];
          }
        } else {
          items = JSON.parse(localStorage.getItem("guest_cart") || "[]");
        }

        const subtotal = items.reduce(
          (acc, item) => acc + Number(item.price) * (item.qty || 1),
          0
        );

        const savings = 0;
        const storePickup = 0;
        const tax = 0;
        const total = subtotal - savings + storePickup + tax;

        setCart({ subtotal, savings, storePickup, tax, total });
      } catch (err) {
        console.error("Error fetching cart:", err);
      }
    };

    loadCart();
  }, [accessToken]);

  // Form submission will now trigger PhonePe flow instead of direct checkout
  const handleSubmit = async (e) => {
    e.preventDefault();
    await initiatePayment();
  };
  


    return (
        <>
            <section className="bg-white py-8 antialiased dark:bg-gray-900 md:py-16">
                <form
                    onSubmit={handleSubmit}
                    action="#"
                    className="mx-auto max-w-screen-xl px-4 2xl:px-0"
                >
                    {/* Steps */}
                    <ol className="items-center flex w-full max-w-2xl text-center text-sm font-medium text-gray-500 dark:text-gray-400 sm:text-base">
                        <li className="after:border-1 flex items-center text-blue-700 after:mx-6 after:hidden after:h-1 after:w-full after:border-b after:border-gray-200 dark:text-blue-500 dark:after:border-gray-700 sm:after:inline-block sm:after:content-[''] md:w-full xl:after:mx-10">
                            <span className="flex items-center after:mx-2 after:text-gray-200 after:content-['/'] dark:after:text-gray-500 sm:after:hidden">
                                <svg className="me-2 h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                                    <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M8.5 11.5 11 14l4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                    />
                                </svg>
                                Cart
                            </span>
                        </li>
                        <li className="after:border-1 flex items-center text-blue-700 after:mx-6 after:hidden after:h-1 after:w-full after:border-b after:border-gray-200 dark:text-blue-500 dark:after:border-gray-700 sm:after:inline-block sm:after:content-[''] md:w-full xl:after:mx-10">
                            <span className="flex items-center after:mx-2 after:text-gray-200 after:content-['/'] dark:after:text-gray-500 sm:after:hidden">
                                <svg className="me-2 h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                                    <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M8.5 11.5 11 14l4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                    />
                                </svg>
                                Checkout
                            </span>
                        </li>
                        <li className="flex shrink-0 items-center">
                            <svg className="me-2 h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M8.5 11.5 11 14l4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                />
                            </svg>
                            Order summary
                        </li>
                    </ol>

                    <div className="mt-6 sm:mt-8 lg:flex lg:items-start lg:gap-12 xl:gap-16">
                        <div className="min-w-0 flex-1 space-y-8">
                            {/* Delivery Details */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Delivery Details
                                </h2>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {/* name */}
                                    <div>
                                        <label htmlFor="your_name" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"> Your name </label>
                                        <input type="text" id="your_name" value={formData.your_name} onChange={handleChange} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500" placeholder="Bonnie Green" required />
                                    </div>
                                    {/* email */}
                                    <div>
                                        <label htmlFor="your_email" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"> Your email* </label>
                                        <input type="email" id="your_email" value={formData.your_email} onChange={handleChange} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500" placeholder="name@flowbite.com" required />
                                    </div>
                                    {/* phone */}
                                    <div>
                                        <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"> Phone Number* </label>
                                        <div className="flex items-center">
                                            <button type="button" className="z-10 inline-flex shrink-0 items-center rounded-s-lg border border-gray-300 bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white">+91</button>
                                            <div className="relative w-full">
                                                <input type="text" id="phone" value={formData.phone} onChange={handleChange} className="z-20 block w-full rounded-e-lg border border-s-0 border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:border-s-gray-700 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500" placeholder="1234567890" required />
                                            </div>
                                        </div>
                                    </div>
                                    {/* country */}
                                    <div>
                                        <div className="mb-2 flex items-center gap-2">
                                            <label htmlFor="country" className="block text-sm font-medium text-gray-900 dark:text-white"> Country* </label>
                                        </div>
                                        <select id="country" value={formData.country} onChange={handleChange} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                                            <option value="IN">India</option>
                                        </select>
                                    </div>
                                    {/* state */}
                                    <div>
                                        <label htmlFor="state" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"> State </label>
                                        <input type="text" id="state" value={formData.state} onChange={handleChange} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="UP, Rajasthan (etc.)" required />
                                    </div>
                                    {/* city */}
                                    <div>
                                        <label htmlFor="city" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"> City* </label>
                                        <input type="text" id="city" value={formData.city} onChange={handleChange} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="New Delhi, Jaipur (etc.)" required />
                                    </div>
                                    {/* address */}
                                    <div>
                                        <label htmlFor="full_address" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"> Address </label>
                                        <input type="text" id="full_address" value={formData.full_address} onChange={handleChange} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="Flat, Street, colony" required />
                                    </div>
                                    {/* pincode */}
                                    <div>
                                        <label htmlFor="pincode" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"> Pincode </label>
                                        <input type="text" id="pincode" value={formData.pincode} onChange={handleChange} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="110001" required />
                                    </div>
                                </div>
                            </div>

                            {/* Payment */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Payment</h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 ps-4 dark:border-gray-700 dark:bg-gray-800">
                                    <div className="flex items-start">
                                        <div className="flex h-5 items-center">
                                        <input
                                            id="UPI"
                                            type="radio"
                                            name="paymentMethod"
                                            checked={formData.paymentMethod === "UPI"}
                                            onChange={handleRadioChange}
                                            className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700"
                                        />
                                        </div>
                                        <div className="ms-4 text-sm">
                                        <label htmlFor="UPI" className="font-medium leading-none text-gray-900 dark:text-white">
                                            UPI or Netbanking
                                        </label>
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            Pay instantly using your UPI ID
                                        </p>
                                        </div>
                                    </div>
                                    </div>


                                </div>
                            </div>

                            {/* Delivery Methods */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Delivery Methods</h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 ps-4 dark:border-gray-700 dark:bg-gray-800">
                                    <div className="flex items-start">
                                        <div className="flex h-5 items-center">
                                        <input
                                            id="StandardDelivery"
                                            type="radio"
                                            name="deliveryMethod"
                                            checked={formData.deliveryMethod === "StandardDelivery"}
                                            onChange={handleRadioChange}
                                            className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700"
                                        />
                                        </div>
                                        <div className="ms-4 text-sm">
                                        <label htmlFor="StandardDelivery" className="font-medium leading-none text-gray-900 dark:text-white">
                                            Standard Delivery – ₹75
                                        </label>
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            Delivered within 4-7 business days
                                        </p>
                                        </div>
                                    </div>
                                    </div>

                                </div>
                            </div>

                            {/* Voucher */}
                            <div>
                                <label htmlFor="voucher" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"> Enter a gift card, voucher or promotional code </label>
                                <div className="flex max-w-md items-center gap-4">
                                    <input type="text" id="voucher" value={formData.voucher} onChange={handleChange} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="" />
                                    <button type="button" className="flex items-center justify-center rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white">Apply</button>
                                </div>
                            </div>
                        </div>

                        {/* Cart Summary */}
                        <div className="mt-6 w-full space-y-6 sm:mt-8 lg:mt-0 lg:max-w-xs xl:max-w-md">
                            <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                                <li className="flex items-center justify-between gap-4 py-3">
                                    <span className="text-base text-gray-500 dark:text-gray-400">Subtotal</span>
                                    <span className="text-base font-medium text-gray-900 dark:text-white">{cart.subtotal}</span>
                                </li>
                                <li className="flex items-center justify-between gap-4 py-3">
                                    <span className="text-base text-gray-500 dark:text-gray-400">Savings</span>
                                    <span className="text-base font-medium text-green-500">₹75</span>
                                </li>
                                
                                <li className="flex items-center justify-between gap-4 py-3">
                                    <span className="text-base font-bold text-gray-900 dark:text-white">Total</span>
                                    <span className="text-base font-bold text-gray-900 dark:text-white">{cart.total}</span>
                                </li>
                            </ul>
                            <div className="space-y-3">
                                <button type="submit" className="flex w-full items-center justify-center rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white">Proceed to Payment</button>
                            </div>
                        </div>
                    </div>
                </form>
            </section>
        </>
    );
}
