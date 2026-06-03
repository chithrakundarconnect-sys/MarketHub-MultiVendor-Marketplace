
"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

import { Navbar } from "@/components/navbar";
import { ProductGrid } from "@/components/product-grid";
import { onAuthStateChanged, User } from "firebase/auth";

// ✅ your buyer components
import BuyerHero from "@/components/buyer-hero";
import { HeroSection } from "@/components/hero-section";
import { ChatAssistant } from "@/components/chat-assistant";


export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");



  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
    if (!user) {
      setLoading(false);
      return;
    }

    const snap = await getDoc(doc(db, "users", user.uid));

if (snap.exists()) {
  const userRole = snap.data().role;

  setRole(userRole);
}


    setLoading(false);
  });

  return () => unsubscribe();
}, []);

  // ✅ LOADING SCREEN
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
  <Navbar search={search} setSearch={setSearch} />

{role === "seller" ? (
  <>
    <HeroSection />
  </>
) : (
  <>
    <BuyerHero />
  <ProductGrid search={search} />
    <ChatAssistant />
  </>
)}

      
      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                About
              </h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">About Us</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Careers</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Press</a></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                Support
              </h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Help Center</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Contact Us</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Returns</a></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                Sellers
              </h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Become a Seller</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Seller Guidelines</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Seller Portal</a></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                Legal
              </h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              &copy; 2026 MarketHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
