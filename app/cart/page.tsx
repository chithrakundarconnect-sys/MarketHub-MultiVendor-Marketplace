"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";


export default function CartPage() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const router = useRouter();
  

const increaseQty = async (item: any) => {
  setUpdatingId(item.id);

  await updateDoc(doc(db, "cart", item.id), {
    quantity: item.quantity + 1,
  });

  setUpdatingId(null);
};

const decreaseQty = async (item: any) => {
  setUpdatingId(item.id);

  if (item.quantity === 1) {
    await deleteDoc(doc(db, "cart", item.id));
  } else {
    await updateDoc(doc(db, "cart", item.id), {
      quantity: item.quantity - 1,
    });
  }

  setUpdatingId(null);
};

const removeItem = async (id: string) => {
  await deleteDoc(doc(db, "cart", id));
};

const total = cartItems.reduce(
  (sum, item) => sum + item.price * (item.quantity || 1),
  0
);

 useEffect(() => {
  let unsubscribeCart: (() => void) | undefined;

  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    // always clean previous listener when auth changes
    if (unsubscribeCart) {
      unsubscribeCart();
      unsubscribeCart = undefined;
    }

    if (!user) {
      setCartItems([]);
      return;
    }

    const q = query(
      collection(db, "cart"),
      where("userId", "==", user.uid)
    );

    unsubscribeCart = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCartItems(data);
      },
      (error) => {
        console.error("Cart listener error:", error);
        if (unsubscribeCart) {
          unsubscribeCart();
          unsubscribeCart = undefined;
        }
      }
    );
  });

  return () => {
    if (unsubscribeCart) unsubscribeCart();
    unsubscribeAuth();
  };
}, []);

const placeOrder = async () => {
  try {
    const user = auth.currentUser;

    if (!user) {
      alert("Please login");
      return;
    }

    if (cartItems.length === 0) {
      alert("Cart is empty");
      return;
    }

    // save order
   const orderRef = await addDoc(collection(db, "orders"), {
      userId: user.uid,

      items: cartItems.map((item) => ({
        productId: item.productId,
        name: item.productName,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      })),

      total,

      status: "pending",

      createdAt: serverTimestamp(),
    });

    // clear cart
    for (const item of cartItems) {
      await deleteDoc(doc(db, "cart", item.id));
    }

    // redirect
   router.push(`/order-success?id=${orderRef.id}`);

  } catch (error) {
    console.error(error);
    alert("Order failed");
  }
};
  return (
  <div className="min-h-screen bg-gray-100 p-4 sm:p-6">

    {/* BACK BUTTON */}
    <button
      onClick={() => router.push("/")}
      className="flex items-center gap-2 text-gray-600 hover:text-black transition mb-6"
    >
      <ArrowLeft className="w-4 h-4" />
      Back to Home
    </button>

    <div className="max-w-5xl mx-auto">

      {/* TITLE */}
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Your Cart
      </h1>

      {cartItems.length === 0 ? (

        <div className="bg-white rounded-2xl p-10 text-center shadow-sm border">
          <p className="text-gray-500 text-lg">
            No items in cart
          </p>
        </div>

      ) : (

        <div className="grid lg:grid-cols-3 gap-6">

          {/* LEFT SIDE - PRODUCTS */}
          <div className="lg:col-span-2">

            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border rounded-2xl shadow-sm p-4 mb-4"
              >

                <div className="flex gap-4">

                  {/* IMAGE */}
                  <img
                    src={item.image}
                    className="w-24 h-24 object-cover rounded-xl border"
                  />

                  {/* DETAILS */}
                  <div className="flex-1">

                    {/* TOP */}
                    <div className="flex justify-between items-start">

                      <div>
                        <h2 className="font-semibold text-lg text-gray-800">
                          {item.productName}
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                          Premium Product
                        </p>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 text-sm hover:text-red-700"
                      >
                        Remove
                      </button>

                    </div>

                    {/* PRICE */}
                    <p className="text-2xl font-bold mt-3 text-black">
                      ${item.price}
                    </p>

                    {/* QUANTITY */}
                    <div className="flex items-center gap-3 mt-4">

                      <button
                        disabled={updatingId === item.id}
                        className="w-9 h-9 rounded-full border flex items-center justify-center hover:bg-gray-100"
                        onClick={() => decreaseQty(item)}
                      >
                        -
                      </button>

                      <span className="font-semibold text-lg">
                        {item.quantity || 1}
                      </span>

                      <button
                        disabled={updatingId === item.id}
                        className="w-9 h-9 rounded-full border flex items-center justify-center hover:bg-gray-100"
                        onClick={() => increaseQty(item)}
                      >
                        +
                      </button>

                    </div>

                  </div>
                </div>
              </div>
            ))}

          </div>

          {/* RIGHT SIDE - TOTAL CARD */}
          <div>

            <div className="bg-white border rounded-2xl shadow-sm p-6 sticky top-24">

              <h2 className="text-xl font-semibold mb-5">
                Order Summary
              </h2>

              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-600">
                  Items
                </span>

                <span className="font-medium">
                  {cartItems.length}
                </span>
              </div>

              <div className="flex justify-between items-center border-t pt-4 mb-5">

                <span className="text-lg font-semibold">
                  Total
                </span>

                <span className="text-2xl font-bold">
                  ${total.toFixed(2)}
                </span>

              </div>

              <button
                onClick={placeOrder}
                className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition"
              >
                Place Order
              </button>

            </div>

          </div>

        </div>
      )}
    </div>
  </div>
);
}