"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock3,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    let unsubscribeOrders: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeOrders) {
        unsubscribeOrders();
        unsubscribeOrders = undefined;
      }

      if (!user) {
        setOrders([]);
        return;
      }

      const q = query(
        collection(db, "orders"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      unsubscribeOrders = onSnapshot(
        q,
        (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setOrders(data);
        },
        (error) => {
          console.error("Orders listener error:", error);
          if (unsubscribeOrders) {
            unsubscribeOrders();
            unsubscribeOrders = undefined;
          }
        }
      );
    });

    return () => {
      if (unsubscribeOrders) unsubscribeOrders();
      unsubscribeAuth();
    };
  }, []);

  const getStatusUI = (status: string) => {
    switch (status) {
      case "delivered":
        return {
          color: "bg-green-100 text-green-700",
          icon: <CheckCircle2 className="w-4 h-4" />,
        };

      case "shipped":
        return {
          color: "bg-blue-100 text-blue-700",
          icon: <Truck className="w-4 h-4" />,
        };

      default:
        return {
          color: "bg-yellow-100 text-yellow-700",
          icon: <Clock3 className="w-4 h-4" />,
        };
    }
  };

  return (
    
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
       {/* TOP BAR */}
<div className="flex flex-col gap-4 mb-8">

  {/* BACK BUTTON */}
  <Link
    href="/profile"
    className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition w-fit"
  >
   <ArrowLeft className="w-4 h-4" />
Back to Profile
  </Link>

  {/* HEADER */}
  <div className="flex items-center gap-3">

    <div className="bg-black text-white p-3 rounded-xl">
      <ShoppingBag className="w-6 h-6" />
    </div>

    <div>
      <h1 className="text-3xl font-bold text-gray-900">
        My Orders
      </h1>

      <p className="text-gray-500 mt-1">
        Track and manage all your orders
      </p>
    </div>

  </div>

</div>


        {/* Empty State */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Package className="w-10 h-10 text-gray-400" />
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No Orders Yet
            </h2>

            <p className="text-gray-500">
              Start shopping to see your orders here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order: any) => {
              const statusUI = getStatusUI(order.status);

              return (
                <Link
                   href={`/orders/${order.id}`}
                   key={order.id}
                   >
                <div
                  className="bg-white border rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition"
                >
                  {/* Top Header */}
                  <div className="border-b px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gray-50">
                    <div>
                      <p className="text-sm text-gray-500">
                        ORDER ID
                      </p>

                      <h2 className="font-semibold text-gray-900 break-all">
                        {order.id}
                      </h2>
                    </div>

                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-sm text-gray-500">
                          TOTAL
                        </p>

                        <h2 className="text-xl font-bold text-black">
                          ₹{Number(order.total).toLocaleString("en-IN")}
                        </h2>
                      </div>

                      <div
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${statusUI.color}`}
                      >
                        {statusUI.icon}
                        {order.status}
                      </div>
                    </div>
                  </div>

                  {/* Products */}
<div className="p-4 space-y-4">

  {order.items.map((item: any, index: number) => (
    <div
      key={index}
      className="flex gap-4 border rounded-2xl p-3 hover:bg-gray-50 transition"
    >

      {/* IMAGE */}
      <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">

        <img
          src={item.image}
          alt={item.productName || item.name}
          className="w-full h-full object-cover"
        />

      </div>

      {/* INFO */}
      <div className="flex-1 flex flex-col justify-between">

        <div>
          <h3 className="font-semibold text-gray-900 line-clamp-2">
            {item.productName || item.name}
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Qty: {item.quantity}
          </p>
        </div>

        <div className="flex items-center justify-between mt-3">

          <p className="text-lg font-bold">
            ₹{Number(item.price).toLocaleString("en-IN")}
          </p>

          <div
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusUI.color}`}
          >
            {statusUI.icon}
            {order.status}
          </div>

        </div>

      </div>

    </div>
  ))}

</div>

{/* TRACKING */}
<div className="px-4 pb-4">

  <div className="flex items-center justify-between border rounded-2xl p-4">

    <div className="flex items-center gap-2">

      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center ${
          order.status === "delivered"
            ? "bg-green-500 text-white"
            : order.status === "shipped"
            ? "bg-blue-500 text-white"
            : "bg-yellow-500 text-white"
        }`}
      >

        {order.status === "delivered" ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : order.status === "shipped" ? (
          <Truck className="w-4 h-4" />
        ) : (
          <Clock3 className="w-4 h-4" />
        )}

      </div>

      <div>
        <p className="font-medium capitalize">
          {order.status}
        </p>

        <p className="text-xs text-gray-500">
          Order is being processed
        </p>
      </div>

    </div>

  </div>

</div>

                </div>
                 </Link> 
              );
            })}
          </div>
        )}
      </div>
    </div>
  
  );
}