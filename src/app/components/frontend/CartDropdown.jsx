"use client";
import React, { useState, useEffect } from "react";
import { ShoppingCart, ChevronDown, X } from "lucide-react";
import { useSession } from "next-auth/react";

export default function CartDropdown() {
  const [open, setOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;

  // Load cart (API or localStorage)
  useEffect(() => {
    const loadCart = async () => {
      if (accessToken) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/cart`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );
          if (res.ok) {
            const data = await res.json();
            console.log("Fetched cart data:", data);
            setCart(data.items || []);
          }
        } catch (err) {
          console.error("Error fetching cart:", err);
        }
      } else {
        const localCart = JSON.parse(
          localStorage.getItem("guest_cart") || "[]"
        );
        setCart(localCart);
      }
    };
    loadCart();
  }, [accessToken, open]); // reload when dropdown opens

  // Remove item
  const removeFromCart = async (bookId) => {
    if (accessToken) {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/cart/items/${bookId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (res.ok) {
          setCart((prev) => prev.filter((item) => item.bookId !== bookId));
        }
      } catch (err) {
        console.error("Error removing item:", err);
      }
    } else {
      const updated = cart.filter((item) => item.bookId !== bookId);
      setCart(updated);
      localStorage.setItem("guest_cart", JSON.stringify(updated));
    }
  };

  return (
    <div className="relative inline-block">
      {/* Cart Button */}
      <button
        onClick={() => setOpen(!open)}
        type="button"
        className="inline-flex items-center rounded-lg justify-center p-2 hover:bg-gray-100 text-sm font-medium text-gray-900"
      >
        <ShoppingCart className="w-5 h-5 lg:me-1" />
        <span className="hidden sm:flex">My Cart</span>
        <ChevronDown className="hidden sm:flex w-4 h-4 ms-1" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-72 z-10 space-y-4 rounded-lg bg-white p-4 shadow-lg">
          {cart.length === 0 ? (
            <p className="text-sm text-gray-500 text-center">Your cart is empty</p>
          ) : (
            <>
              {cart.map((item) => (
                <div key={item.bookId} className="grid grid-cols-2">
                  <div>
                    <a
                      href={`/books/${item.bookId}`}
                      className="truncate text-sm font-semibold text-gray-900 hover:underline"
                    >
                      {item.title || `Book #${item.bookId}`}
                    </a>
                    <p className="mt-0.5 text-sm text-gray-500">
                      ${item.price} × {item.qty}
                    </p>
                  </div>
                  <div className="flex items-center justify-end gap-4">
                    <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.bookId)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Checkout Button */}
              <a
                href="/checkout"
                className="inline-flex w-full items-center justify-center rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
              >
                Proceed to Checkout
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );
}
