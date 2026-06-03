"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { useParams } from "next/navigation";
import Link from "next/link";

import {
  ArrowLeft,
  CheckCircle2,
  Truck,
  Clock3,
} from "lucide-react";

export default function OrderDetailsPage() {
  const params = useParams();

  const [order, setOrder] = useState<any>(null);
  const [showCancelBox, setShowCancelBox] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [rating, setRating] = useState(0);
const [review, setReview] = useState("");
const [submittingReview, setSubmittingReview] = useState(false);
const [showReviewBox, setShowReviewBox] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      const docRef = doc(db, "orders", params.id as string);

      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setOrder({
          id: docSnap.id,
          ...docSnap.data(),
        });
      }
    };

    fetchOrder();
  }, [params.id]);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const deliveryDate = new Date();

  deliveryDate.setDate(deliveryDate.getDate() + 5);

  const submitReview = async () => {

  try {

    setSubmittingReview(true);

    await addDoc(collection(db, "reviews"), {

      orderId: order.id,
      userId: order.userId,

      rating,
      review,

      createdAt: serverTimestamp(),

    });

    alert("Review submitted!");

    setRating(0);
    setReview("");

  } catch (error) {

    console.log(error);

    alert("Failed to submit review");

  } finally {

    setSubmittingReview(false);

  }
};

  const handleCancelOrder = async () => {

  if (!cancelReason) {
    alert("Please select cancellation reason");
    return;
  }

  try {

    await updateDoc(doc(db, "orders", order.id), {
      status: "cancelled",
      cancelReason: cancelReason,
      cancelledAt: new Date(),
    });

    setOrder({
      ...order,
      status: "cancelled",
      cancelReason: cancelReason,
    });

    setShowCancelBox(false);

    alert("Order cancelled successfully");

  } catch (error) {

    console.log(error);

    alert("Failed to cancel order");
  }
};

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      <div className="max-w-5xl mx-auto">

        {/* BACK BUTTON */}
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>

        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <p className="text-sm text-gray-500">
                ORDER ID
              </p>

              <h1 className="font-bold text-lg break-all">
                {order.id}
              </h1>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                TOTAL AMOUNT
              </p>

              <h2 className="text-3xl font-bold">
                ₹{Number(order.total).toLocaleString("en-IN")}
              </h2>
            </div>

          </div>

        </div>

        {/* TRACKING */}
<div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">

  <div className="flex items-center justify-between mb-8">

    <div>
      <h2 className="text-xl font-semibold">
        Order Tracking
      </h2>

      <p className="text-sm text-gray-500 mt-1">
        Track your order status
      </p>
    </div>

    <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium capitalize">
      {order.status}
    </div>

  </div>

  {/* TRACKING LINE */}
  <div className="relative flex items-center justify-between">

    {/* LINE */}
    <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 rounded-full">

      <div
        className={`h-1 rounded-full ${
          order.status === "pending"
            ? "w-[20%]"
            : order.status === "shipped"
            ? "w-[60%]"
            : "w-full"
        } bg-green-500`}
      />

    </div>

    {/* STEP 1 */}
    <div className="relative z-10 flex flex-col items-center">
      <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center">
        <CheckCircle2 className="w-5 h-5" />
      </div>

      <p className="mt-2 font-medium text-sm">
        Ordered
      </p>

      <p className="text-xs text-gray-500">
        Confirmed
      </p>
    </div>

    {/* STEP 2 */}
    <div className="relative z-10 flex flex-col items-center">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center ${
          order.status === "shipped" ||
          order.status === "delivered"
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-gray-500"
        }`}
      >
        <Truck className="w-5 h-5" />
      </div>

      <p className="mt-2 font-medium text-sm">
        Shipped
      </p>

      <p className="text-xs text-gray-500">
        On the way
      </p>
    </div>

    {/* STEP 3 */}
    <div className="relative z-10 flex flex-col items-center">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center ${
          order.status === "delivered"
            ? "bg-green-500 text-white"
            : "bg-gray-200 text-gray-500"
        }`}
      >
        <CheckCircle2 className="w-5 h-5" />
      </div>

      <p className="mt-2 font-medium text-sm">
        Delivered
      </p>

      <p className="text-xs text-gray-500">
        Completed
      </p>
    </div>

  </div>

  {/* DELIVERY DATE */}
  <div className="mt-8 bg-gray-50 border rounded-2xl p-4">

    <div className="flex items-center gap-2 text-gray-700">

      <Clock3 className="w-4 h-4" />

      <p className="font-medium">
        Expected Delivery
      </p>

    </div>

    <p className="mt-2 text-lg font-bold">
      {deliveryDate.toDateString()}
    </p>

  </div>

</div>

{order.status === "cancelled" && (

  <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl">

    <h3 className="font-semibold text-lg">
      Order Cancelled
    </h3>

    <p className="mt-1 text-sm">
      Reason: {order.cancelReason}
    </p>

  </div>

)}

        {/* PRODUCTS */}
        <div className="space-y-4">

          {order.items.map((item: any, index: number) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm border p-4 flex gap-4"
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
              <div className="flex-1">

                <h2 className="font-semibold text-lg text-gray-900">
                  {item.productName || item.name}
                </h2>

                <p className="text-gray-500 mt-2">
                  Quantity: {item.quantity}
                </p>

                <p className="text-2xl font-bold mt-3">
                  ₹{Number(item.price).toLocaleString("en-IN")}
                </p>

              </div>

            </div>
          ))}

        </div>
        {/* ACTION SECTION */}
<div className="mt-8 bg-white border rounded-2xl shadow-sm p-6">

  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

    {/* LEFT SIDE */}
    <div>

      <h3 className="text-lg font-semibold text-gray-900">
        Need Help?
      </h3>

      <p className="text-sm text-gray-500 mt-1">
        You can cancel or manage your order easily.
      </p>

    </div>

    {/* RIGHT SIDE BUTTONS */}
    <div className="flex flex-wrap gap-3">

      {/* CANCEL BUTTON */}
      {order.status !== "delivered" &&
       order.status !== "cancelled" && (

        <button
          onClick={() => setShowCancelBox(true)}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium transition shadow-sm"
        >
          Cancel Order
        </button>
      )}

      {/* RETURN BUTTON */}
      {order.status === "delivered" && (
        <button
          className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-medium transition shadow-sm"
        >
          Return Product
        </button>
      )}

    </div>

  </div>

  {/* CANCEL POPUP */}
  {showCancelBox && (
    <div className="mt-6 border-t pt-6">

      <h4 className="text-lg font-semibold mb-4">
        Cancel Order
      </h4>

      {/* DROPDOWN */}
      <select
        value={cancelReason}
        onChange={(e) => setCancelReason(e.target.value)}
        className="w-full border rounded-xl p-3 mb-4 outline-none focus:ring-2 focus:ring-red-400"
      >
        <option value="">
          Select cancellation reason
        </option>

        <option value="Ordered by mistake">
          Ordered by mistake
        </option>

        <option value="Found cheaper elsewhere">
          Found cheaper elsewhere
        </option>

        <option value="Delivery taking too long">
          Delivery taking too long
        </option>

        <option value="Need to change address">
          Need to change address
        </option>

        <option value="Other">
          Other
        </option>
      </select>

      {/* TEXTAREA */}
      <textarea
        placeholder="Additional comments..."
        className="w-full border rounded-xl p-3 h-28 resize-none outline-none focus:ring-2 focus:ring-red-400"
      />

      {/* BUTTONS */}
      <div className="flex gap-3 mt-5">

       <button
  onClick={handleCancelOrder}
  className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-medium transition"
>
  Confirm Cancel
</button>


        <button
          onClick={() => setShowCancelBox(false)}
          className="border hover:bg-gray-100 px-5 py-2.5 rounded-xl font-medium transition"
        >
          Close
        </button>

      </div>

    </div>
  )}

{/* REVIEW SECTION */}
{order.status === "delivered" && (

  <div className="mt-8 bg-white border rounded-2xl shadow-sm p-6">{/* HEADER */}
<div className="flex items-center justify-between">

  <div>

    <h2 className="text-xl font-semibold">
      Rate Your Order
    </h2>

    <p className="text-sm text-gray-500 mt-1">
      Share your experience about this product
    </p>

  </div>

  {!showReviewBox && (
    <button
      onClick={() => setShowReviewBox(true)}
      className="bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-medium transition"
    >
      Write Review
    </button>
  )}

</div>

{/* REVIEW BOX */}
{showReviewBox && (

  <div className="mt-6 border-t pt-6">

    {/* STARS */}
    <div className="flex gap-2 mb-5">

      {[1, 2, 3, 4, 5].map((star) => (

        <button
          key={star}
          onClick={() => setRating(star)}
          className={`text-4xl transition ${
            rating >= star
              ? "text-yellow-400"
              : "text-gray-300"
          }`}
        >
          ★
        </button>

      ))}

    </div>

    {/* TEXTAREA */}
    <textarea
      value={review}
      onChange={(e) => setReview(e.target.value)}
      placeholder="Write your review..."
      className="w-full border rounded-2xl p-4 h-32 resize-none outline-none focus:ring-2 focus:ring-black"
    />

    {/* BUTTONS */}
    <div className="flex gap-3 mt-5">

      <button
        disabled={submittingReview || rating === 0}
        onClick={submitReview}
        className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-medium transition disabled:opacity-50"
      >
        {submittingReview
          ? "Submitting..."
          : "Submit Review"}
      </button>

      <button
        onClick={() => setShowReviewBox(false)}
        className="border hover:bg-gray-100 px-6 py-3 rounded-xl font-medium transition"
      >
        Cancel
      </button>

    </div>

  </div>

)}

  </div>)}

</div>

      </div>

    </div>
  );
}