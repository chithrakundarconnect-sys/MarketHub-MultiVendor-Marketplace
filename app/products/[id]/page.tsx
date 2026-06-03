"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
  orderBy,
} from "firebase/firestore";

import { useParams } from "next/navigation";

import {
ShoppingCart,
Star,
Truck,
ShieldCheck,
Heart,
Loader2,
Share2,
} from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ProductDetailsPage() {

  const params = useParams();

  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
const [isLiked, setIsLiked] = useState(false);
const [reviews, setReviews] = useState<any[]>([]);
const [rating, setRating] = useState(0);
const [review, setReview] = useState("");
const [submittingReview, setSubmittingReview] = useState(false);
const [selectedImage, setSelectedImage] = useState("");
const [wishlistId, setWishlistId] = useState("");
const [similarProducts, setSimilarProducts] = useState<any[]>([]);

  useEffect(() => {

    const fetchProduct = async () => {

      const docRef = doc(
        db,
        "products",
        params.id as string
      );

      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {

      const productData: any = {
  id: docSnap.id,
  ...docSnap.data(),
};

setProduct(productData);

setSelectedImage(
  productData.image ||
  productData.images?.[0] ||
  ""
);
const similarQuery = query(
  collection(db, "products"),
  where("category", "==", productData.category)
);

const similarSnapshot = await getDocs(similarQuery);

const similarData = similarSnapshot.docs
  .map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
  .filter((item: any) => item.id !== productData.id);

setSimilarProducts(similarData);
      }

    };

    fetchProduct();

    // keep reviews and wishlist listeners tied to auth state so they unsubscribe on logout
    let unsubscribeReviews: (() => void) | undefined;
    let unsubscribeWishlist: (() => void) | undefined;
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeReviews) {
        unsubscribeReviews();
        unsubscribeReviews = undefined;
      }

      if (unsubscribeWishlist) {
        unsubscribeWishlist();
        unsubscribeWishlist = undefined;
      }

      if (!user) {
        setReviews([]);
        setIsLiked(false);
        setWishlistId("");
        return;
      }

      // Setup wishlist listener
      const wishlistQuery = query(
        collection(db, "wishlist"),
        where("userId", "==", user.uid),
        where("productId", "==", params.id)
      );

      unsubscribeWishlist = onSnapshot(wishlistQuery, (snapshot) => {
        if (!snapshot.empty) {
          setIsLiked(true);
          setWishlistId(snapshot.docs[0].id);
        } else {
          setIsLiked(false);
          setWishlistId("");
        }
      });

      const reviewsQuery = query(
        collection(db, "reviews"),
        where("productId", "==", params.id),
        orderBy("createdAt", "desc")
      );

      unsubscribeReviews = onSnapshot(
        reviewsQuery,
        (snapshot) => {
          const reviewsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setReviews(reviewsData);
        },
        (error) => {
          console.error("Reviews listener error:", error);
          if (unsubscribeReviews) {
            unsubscribeReviews();
            unsubscribeReviews = undefined;
          }
        }
      );
    });

    return () => {
      if (unsubscribeReviews) unsubscribeReviews();
      if (unsubscribeWishlist) unsubscribeWishlist();
      unsubscribeAuth();
    };

}, [params.id]);
const handleShare = async () => {
  try {
    await navigator.share({
      title: product.name,
      text: product.description,
      url: window.location.href,
    });
  } catch (error) {
    console.log(error);
  }
};

const handleWishlist = async () => {

  const user = auth.currentUser;

  if (!user) {
    toast.error("Please login first");
    return;
  }

  try {

    if (isLiked) {

      await deleteDoc(
        doc(db, "wishlist", wishlistId)
      );

      toast.success("Removed from wishlist");

    } else {

      await addDoc(
        collection(db, "wishlist"),
        {
          userId: user.uid,
          productId: product.id,
          name: product.name,
          image: product.image,
          price: product.price,
          createdAt: serverTimestamp(),
        }
      );

      toast.success("Added to wishlist ❤️");
    }

  } catch (error) {
    console.log(error);
  }
};

  const handleAddToCart = async () => {

  setIsLoading(true);

  try {

    const user = auth.currentUser;

    if (!user) {
    toast.error("Please login first");
      setIsLoading(false);
      return;
    }

    const q = query(
      collection(db, "cart"),
      where("userId", "==", user.uid),
      where("productId", "==", product.id)
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {

      const existingDoc = snapshot.docs[0];

      await updateDoc(doc(db, "cart", existingDoc.id), {
        quantity: existingDoc.data().quantity + 1,
      });

    } else {

      await addDoc(collection(db, "cart"), {
        userId: user.uid,
        productId: product.id,
        productName: product.name,
        image: product.image,
        price: product.price,
        quantity: 1,
        createdAt: serverTimestamp(),
      });

    }

   toast.success("Added to cart");

  } catch (error) {

    console.log(error);

   toast.error("Failed to add");
  }

  setIsLoading(false);

};

const handlePayment = async () => {

const user = auth.currentUser;

if (!user) {
toast.error("Please login first");
return;
}

const options = {
key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,

amount: Number(product.price) * 100,

currency: "INR",

name: "MarketHub",

description: product.name,

image: product.image,

handler: async function (response: any) {

  toast.success("Payment Successful");

  await addDoc(collection(db, "orders"), {
    userId: user.uid,
    productId: product.id,
    productName: product.name,
    image: product.image,
    price: product.price,
    paymentId: response.razorpay_payment_id,
    createdAt: serverTimestamp(),
  });

},

prefill: {
  name: user.displayName,
  email: user.email,
},

theme: {
  color: "#000000",
},

};

const razorpay = new (window as any).Razorpay(options);

razorpay.open();

};

const submitReview = async () => {

  if (!rating || !review) {
    toast.warning("Please add rating and review");
    return;
  }

  try {

    setSubmittingReview(true);

    const user = auth.currentUser;

    if (!user) {
     toast.error("Please login first");
      return;
    }

    await addDoc(collection(db, "reviews"), {
      productId: product.id,
      userId: user.uid,
      userName: user.displayName || "User",
      rating,
      review,
      createdAt: serverTimestamp(),
    });

    setRating(0);
    setReview("");

   toast.success("Review added");

  } catch (error) {

    console.log(error);

   toast.error("Failed to add review");

  }

  setSubmittingReview(false);

};

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-28">

      <div className="max-w-7xl mx-auto">
        <div className="mb-6">

  <button
    onClick={() => window.history.back()}
    className="flex items-center gap-2 text-gray-600 hover:text-black transition font-medium"
  >
    <ArrowLeft className="w-5 h-5" />

    Back
  </button>

</div>

        <div className="grid md:grid-cols-2 gap-8 bg-white rounded-3xl shadow-sm border p-6">

          {/* IMAGE */}
<div>

  <div className="relative bg-gray-50 rounded-2xl p-4 md:sticky md:top-24">
    <div className="absolute top-4 right-4 flex flex-col gap-3 z-10">

  <button
  onClick={handleWishlist}
    className="w-12 h-12 rounded-full bg-white shadow border flex items-center justify-center"
  >
    <Heart
      className={`w-5 h-5 ${
        isLiked
          ? "fill-red-500 text-red-500"
          : "text-gray-500"
      }`}
    />
  </button>

  <button
    onClick={handleShare}
    className="w-12 h-12 rounded-full bg-white shadow border flex items-center justify-center"
  >
    <Share2 className="w-5 h-5 text-gray-500" />
  </button>

</div>

  <img
    src={selectedImage}
    alt={product.name}
    className="
      w-full
      h-[280px]
      md:h-[500px]
      object-contain
    "
  />
  </div>
  {product.images?.length > 1 && (
  <div className="flex justify-center gap-2 mt-4">

    {product.images.map(
      (img: string, index: number) => (
        <button
          key={index}
          onClick={() => setSelectedImage(img)}
          className={`
            h-3 w-3 rounded-full transition
            ${
              selectedImage === img
                ? "bg-blue-600"
                : "bg-gray-300"
            }
          `}
        />
      )
    )}

  </div>
)}
</div>

          {/* DETAILS */}    
<div>
            {/* CATEGORY */}
            <p className="text-sm text-gray-500 uppercase tracking-wide">
              {product.category}
            </p>

            {/* NAME */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              {product.name}
            </h1>
       <p
  className={`text-gray-500 mt-3 text-sm leading-6 ${
    showFullDescription ? "" : "line-clamp-3"
  }`}
>
  {product.description}
</p><button
onClick={() =>
setShowFullDescription(!showFullDescription)
}
className="text-sm text-black font-medium mt-2 hover:underline"
>
{showFullDescription
? "Read Less"
: "Read More"}
</button>


            {/* SELLER CARD */}
<div className="mt-6 border rounded-2xl p-4 bg-gray-50">

  <h3 className="font-semibold text-lg">
    Seller Details
  </h3>

  <p className="mt-2 font-medium">
    {product.seller || "MarketHub Seller"}
  </p>

  <div className="flex items-center gap-2 mt-2">
    <Star className="w-4 h-4 fill-green-500 text-green-500" />
    <span className="text-sm text-gray-600">
      4.5 Seller Rating
    </span>
  </div>

  <p className="text-sm text-gray-500 mt-1">
    2+ Years Selling Experience
  </p>

</div>

          {/* RATING CARD */}
<div className="mt-6 border rounded-2xl p-4 bg-gray-50">

  <div className="flex items-center gap-2">

    <div className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded-lg">

      <Star className="w-4 h-4 fill-white" />

      <span className="font-semibold">
        {product.rating || 4.5}
      </span>

    </div>

    <span className="font-medium text-gray-800">
      Very Good
    </span>

  </div>

  <div className="flex gap-6 mt-3 text-sm text-gray-600">

    <div>
      <span className="font-semibold text-black">
        120
      </span>{" "}
      Ratings
    </div>

    <div>
      <span className="font-semibold text-black">
        {reviews.length}
      </span>{" "}
      Reviews
    </div>

  </div>

</div>
{/* DELIVERY DETAILS */}
<div className="mt-6 border rounded-2xl p-4 bg-gray-50">

  <h3 className="font-semibold text-lg">
    Delivery Details
  </h3>

  <div className="mt-3 space-y-3">

    <div className="flex items-center gap-3">
      <span>📦</span>
      <p className="text-sm text-gray-700">
        Free Delivery Available
      </p>
    </div>

    <div className="flex items-center gap-3">
      <span>🚚</span>
      <p className="text-sm text-gray-700">
        Estimated Delivery: 3-5 Days
      </p>
    </div>

    <div className="flex items-center gap-3">
      <span>💰</span>
      <p className="text-sm text-gray-700">
        Cash On Delivery Available
      </p>
    </div>

  </div>

</div>

            {/* PRICE */}
            <div className="mt-6">

              <h2 className="text-4xl font-bold text-black">
                ₹{Number(product.price).toLocaleString("en-IN")}
              </h2>

              <p className="text-green-600 font-medium mt-2">
                Inclusive of all taxes
              </p>

            </div>

            {/* FEATURES */}
            <div className="mt-8 space-y-4">

              <div className="flex items-center gap-3">

                <Truck className="w-5 h-5 text-gray-600" />

                <p className="text-gray-700">
                  Free Delivery Available
                </p>

              </div>

              <div className="flex items-center gap-3">

                <ShieldCheck className="w-5 h-5 text-gray-600" />

                <p className="text-gray-700">
                  Secure Payment & Warranty
                </p>

              </div>

            </div>

           {/* DESKTOP BUTTONS */}
<div className="hidden md:flex gap-4 mt-10">


  <button
    onClick={handlePayment}
    disabled={isLoading}
    className="flex-1 bg-black hover:bg-gray-800 text-white py-4 rounded-2xl font-semibold transition"
  >
    Buy Now
  </button>

  <button
    onClick={handleAddToCart}
    disabled={isLoading}
    className="flex items-center justify-center gap-2 flex-1 border border-black py-4 rounded-2xl font-semibold hover:bg-gray-100 transition"
  >

    {isLoading ? (
      <Loader2 className="w-5 h-5 animate-spin" />
    ) : (
      <ShoppingCart className="w-5 h-5" />
    )}

    Add to Cart

  </button>

</div>


</div>
          </div>

        </div>
        {/* CUSTOMER REVIEWS */}
<div className="mt-10">

  <h2 className="text-2xl font-bold mb-4">
    Customer Reviews
  </h2>

  {reviews.length === 0 ? (

    <div className="border rounded-2xl p-6 bg-gray-50 text-center">
      <p className="text-gray-500">
        No reviews yet
      </p>
    </div>

  ) : (

    <div className="space-y-4">

      {reviews.map((item: any) => (

        <div
          key={item.id}
          className="border rounded-2xl p-4 bg-white"
        >

          <div className="flex items-center gap-2 mb-2">

            <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded">

              <Star className="w-3 h-3 fill-white" />

              <span className="text-sm">
                {item.rating}
              </span>

            </div>

            <span className="font-medium">
              {item.userName}
            </span>

          </div>

          <p className="text-gray-700">
            {item.review}
          </p>

        </div>

      ))}

    </div>

  )}

</div>

{/* SIMILAR PRODUCTS */}
<div className="mt-10">

  <h2 className="text-2xl font-bold mb-4">
    Similar Products
  </h2>

  <div className="flex gap-4 overflow-x-auto pb-2">

    {similarProducts.map((item: any) => (

      <Link
        key={item.id}
        href={`/products/${item.id}`}
        className="min-w-[220px]"
      >

        <div className="bg-white border rounded-2xl p-3 hover:shadow-md transition">

         <img
  src={item.image || item.images?.[0]}
  alt={item.name}
  className="w-full h-40 object-contain"
/>


          <h3 className="font-medium mt-3 line-clamp-2">
            {item.name}
          </h3>

          <p className="text-lg font-bold mt-2">
            ₹{Number(item.price).toLocaleString("en-IN")}
          </p>

        </div>

      </Link>

    ))}

  </div>
</div>

<div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex gap-2 md:hidden z-50">

  <button
    onClick={handleAddToCart}
    className="flex-1 border border-black rounded-xl py-3 font-medium"
  >
    Add To Cart
  </button>

  <button
    onClick={handlePayment}
    className="flex-1 bg-black text-white rounded-xl py-3 font-medium"
  >
    Buy Now
  </button>

</div>

      </div>
  );
}