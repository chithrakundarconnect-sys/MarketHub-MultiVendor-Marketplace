"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Heart, Star, Loader2 } from "lucide-react";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import Link from "next/link";
import { toast } from "sonner";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  seller: string;
}

export function ProductCard({
  id,
  name,
  price,
  image,
  rating,
  seller,
}: ProductCardProps){
  const [isLoading, setIsLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [wishlistId, setWishlistId] = useState("");

useEffect(() => {
  let unsubscribeSnapshot: (() => void) | undefined;

  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (unsubscribeSnapshot) {
      unsubscribeSnapshot();
      unsubscribeSnapshot = undefined;
    }

    if (!user) {
      setIsLiked(false);
      setWishlistId("");
      return;
    }

    const q = query(
      collection(db, "wishlist"),
      where("userId", "==", user.uid),
      where("productId", "==", id)
    );

    unsubscribeSnapshot = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          setIsLiked(true);
          setWishlistId(snapshot.docs[0].id);
        } else {
          setIsLiked(false);
          setWishlistId("");
        }
      },
      (error) => {
        console.error("Wishlist product listener error:", error);
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

}, [id]);

const handleWishlist = async () => {

  const user = auth.currentUser;

  if (!user) {
     toast.error("Please login first");
    return;
  }

  try {

    if (isLiked) {

     await deleteDoc(doc(db, "wishlist", wishlistId));
toast.success("Removed from wishlist");

    } else {

      await addDoc(collection(db, "wishlist"), {
        userId: user.uid,
        productId: id,
        name,
        image,
        price,
        createdAt: serverTimestamp(),
      });
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

    // 🔍 Check if product already exists
    const q = query(
      collection(db, "cart"),
      where("userId", "==", user.uid),
      where("productId", "==", id)
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      // ✅ Already exists → increase quantity
      const existingDoc = snapshot.docs[0];

      await updateDoc(doc(db, "cart", existingDoc.id), {
        quantity: existingDoc.data().quantity + 1,
      });
    } else {
      // ✅ New item
      await addDoc(collection(db, "cart"), {
        userId: user.uid,
        productId: id, // 🔥 IMPORTANT
        productName: name,
        price,
        image,
        quantity: 1,
        createdAt: serverTimestamp(),
      });
    }

   toast.success("Product added to cart 🛒");
  } catch (error) {
    console.error(error);
    toast.error("Failed to add to cart");
  }

  setIsLoading(false);
};


  return (
  
<Link href={`/products/${id}`}>
<Card className="group overflow-hidden border-border bg-card transition-all hover:shadow-lg">

      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Wishlist Button */}
        <button
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    handleWishlist();
  }}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur transition-colors hover:bg-background"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isLiked ? "fill-destructive text-destructive" : "text-muted-foreground"
            }`}
          />
        </button>
        
        {/* Quick View Overlay */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-background/95 backdrop-blur p-3 transition-transform duration-300 group-hover:translate-y-0">
          <Button
            className="w-full gap-2"
            size="sm"
            onClick={handleAddToCart}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Seller */}
        <p className="text-xs text-muted-foreground mb-1">{seller}</p>
        
        {/* Title */}
        <h3 className="font-medium text-card-foreground line-clamp-2 mb-2 leading-tight">
          {name}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="text-sm font-medium text-foreground">{rating}</span>
          <span className="text-sm text-muted-foreground">(120)</span>
        </div>
        
        {/* Price */}
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-foreground">
  ₹{Number(price).toLocaleString("en-IN")}
</p>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 md:hidden"
            onClick={handleAddToCart}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
    </Link>
  );
}
