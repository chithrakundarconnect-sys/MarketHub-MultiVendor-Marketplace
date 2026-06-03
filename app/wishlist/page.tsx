"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";

import Link from "next/link";

import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowLeft,
  Star,
} from "lucide-react";

export default function WishlistPage() {

  const [wishlist, setWishlist] = useState<any[]>([]);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = undefined;
      }

      if (!user) {
        setWishlist([]);
        return;
      }

      const q = query(
        collection(db, "wishlist"),
        where("userId", "==", user.uid)
      );

      unsubscribeSnapshot = onSnapshot(
        q,
        (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setWishlist(data);
        },
        (error) => {
          console.error("Wishlist listener error:", error);
          if (unsubscribeSnapshot) {
            unsubscribeSnapshot();
            unsubscribeSnapshot = undefined;
          }
        }
      );
    });

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      unsubscribeAuth();
    };
  }, []);

  const removeWishlist = async (id: string) => {

    await deleteDoc(doc(db, "wishlist", id));

  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      <div className="max-w-6xl mx-auto">

        {/* BACK BUTTON */}
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </Link>

        {/* HEADER */}
<div className="flex items-center justify-between mb-10">

  <div>
    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
      Wishlist
    </h1>

    <p className="text-gray-500 mt-2 text-sm sm:text-base">
      Saved products you loved
    </p>
  </div>

  <div className="hidden sm:flex items-center gap-2 bg-red-50 text-red-500 px-4 py-2 rounded-full">
    <Heart className="w-4 h-4 fill-red-500" />
    <span className="text-sm font-medium">
      {wishlist.length} Items
    </span>
  </div>

</div>

        {/* EMPTY */}
        {wishlist.length === 0 ? (

          <div className="bg-white rounded-3xl border shadow-sm p-12 text-center">

            <Heart className="w-14 h-14 text-gray-300 mx-auto mb-4" />

            <h2 className="text-2xl font-bold text-gray-800">
              Wishlist Empty
            </h2>

            <p className="text-gray-500 mt-2">
              Save products you like
            </p>

          </div>

        ) : (

         <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">

  {wishlist.map((item) => (

    <Link
      key={item.id}
      href={`/products/${item.productId}`}
    >

      <div className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">

        {/* IMAGE SECTION */}
        <div className="relative overflow-hidden bg-gray-100">

          <img
            src={item.image}
            alt={item.name}
            className="w-full h-64 object-cover group-hover:scale-110 transition duration-500"
          />

          {/* HEART BADGE */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-full shadow">

            <Heart className="w-4 h-4 text-red-500 fill-red-500" />

          </div>

        </div>

        {/* CONTENT */}
        <div className="p-5">

          {/* TITLE */}
          <h2 className="font-semibold text-lg text-gray-900 line-clamp-2 min-h-[56px]">
            {item.name}
          </h2>

          {/* RATING */}
          <div className="flex items-center gap-1 mt-3">

            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />

            <span className="text-sm font-semibold text-gray-800">
              4.5
            </span>

            <span className="text-sm text-gray-400">
              (120 reviews)
            </span>

          </div>

          {/* PRICE */}
          <div className="mt-4 flex items-center justify-between">

            <div>
              <p className="text-2xl font-bold text-black">
                ₹{Number(item.price).toLocaleString("en-IN")}
              </p>

              <p className="text-sm text-green-600 font-medium">
                Free Delivery
              </p>
            </div>

          </div>

          {/* BUTTONS */}
          <div className="flex gap-3 mt-6">

            {/* VIEW BUTTON */}
            <button
              className="flex-1 bg-black text-white py-3 rounded-2xl font-medium hover:bg-gray-800 transition flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              View Product
            </button>

            {/* REMOVE BUTTON */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                removeWishlist(item.id);
              }}
              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-red-50 text-red-500 hover:bg-red-100 transition"
            >
              <Trash2 className="w-5 h-5" />
            </button>

          </div>

        </div>

      </div>

    </Link>

  ))}

</div>

        )}

      </div>

    </div>
  );
}