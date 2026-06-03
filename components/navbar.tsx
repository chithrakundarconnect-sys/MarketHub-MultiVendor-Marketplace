"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Menu,
  X,
  Search,
  User,
  Store,
  LayoutDashboard,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore";


export function Navbar({
  search,
  setSearch,
}: {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
 
  

 useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (u) => {
    if (u) {
      const docRef = doc(db, "users", u.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUser({
          uid: u.uid,
          ...docSnap.data(), // 👈 THIS HAS ROLE
        });
      }
    } else {
      setUser(null);
    }
  });

  return () => unsubscribe();
}, []);

useEffect(() => {
  if (!user) return;

  const q = query(
    collection(db, "cart"),
    where("userId", "==", user.uid)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    setCartCount(snapshot.size);
  });

  return () => unsubscribe();
}, [user]);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Store className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">MarketHub</span>
          </Link>

          {/* Search Bar - Hidden on mobile */}
          {user?.role === "buyer" && (
  <div className="hidden flex-1 max-w-md md:flex">
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full pl-10 bg-secondary border-0"
      />
    </div>
  </div>
)}

        { /* Desktop Navigation */}
<div className="hidden items-center gap-2 md:flex">

  {user?.role === "seller" && (
    <Link href="/seller">
      <Button variant="ghost" size="sm" className="gap-2">
        <Store className="h-4 w-4" />
        Sell
      </Button>
    </Link>
  )}

  {user?.role === "admin" && (
    <Link href="/admin">
      <Button variant="ghost" size="sm" className="gap-2">
        <LayoutDashboard className="h-4 w-4" />
        Admin
      </Button>
    </Link>
  )}

  {user ? (
    <>
      <Link href="/profile">
        <Button variant="ghost" size="sm" className="gap-2">
          <User className="h-4 w-4" />
          Profile
        </Button>
      </Link>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => signOut(auth)}
      >
        Logout
      </Button>
    </>
  ) : (
    <Link href="/login">
      <Button variant="ghost" size="sm" className="gap-2">
        <User className="h-4 w-4" />
        Login
      </Button>
    </Link>
  )}

 {user?.role === "buyer" && (
  <Link href="/cart">
    <Button size="sm" className="gap-2">
      <ShoppingCart className="h-4 w-4" />
      <span className="hidden lg:inline">Cart</span>
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-medium text-accent-foreground">
  {cartCount}
</span>
    </Button>
  </Link>
)}


</div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
           {user?.role === "buyer" && (
  <Link href="/cart">
    <Button size="icon" variant="ghost">
      <ShoppingCart className="h-5 w-5" />
    </Button>
  </Link>
)}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
       {user?.role === "buyer" && (
  <div className="pb-3 md:hidden">
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full pl-10 bg-secondary border-0"
      />
    </div>
  </div>
)}
</div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="space-y-1 px-4 py-3">
           
  {user?.role === "seller" && (
  <Link href="/seller" onClick={() => setIsMenuOpen(false)}>
    Seller Dashboard
  </Link>
)}

{user?.role === "admin" && (
  <Link href="/admin" onClick={() => setIsMenuOpen(false)}>
    Admin Dashboard
  </Link>
)}
            {user ? (
  <button
    onClick={() => signOut(auth)}
    className="flex items-center gap-3 px-3 py-2"
  >
    Logout
  </button>
) : (
  <Link href="/login">
    Login
  </Link>
)}

          </div>
        </div>
      )}
    </nav>
  );
}
