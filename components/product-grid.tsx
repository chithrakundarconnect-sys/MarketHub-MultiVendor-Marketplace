"use client";

import { ProductCard } from "./product-card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { onSnapshot } from "firebase/firestore";


const CATEGORIES = [
  "All",
  "Electronics",
  "Fashion",
  "Home & Living",
  "Sports",
  "Beauty",
];

export function ProductGrid({
  search,
}: {
  search: string;
}) {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");

  const [products, setProducts] = useState<any[]>([]);
  const [visibleProducts, setVisibleProducts] = useState(8);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    unsub = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProducts(data);
      },
      (error) => {
        console.error("Products listener error:", error);
        if (unsub) {
          unsub();
          unsub = undefined;
        }
      }
    );

    return () => {
      if (unsub) unsub();
    };
  }, []);



  const handleLoadMore = async () => {
  setIsLoadingMore(true);

  await new Promise((resolve) =>
    setTimeout(resolve, 500)
  );

  setVisibleProducts((prev) => prev + 8);

  setIsLoadingMore(false);
};

  return (
    <section className="bg-background py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
      Featured Products
    </h2>
    <p className="mt-1 text-muted-foreground">
      Discover our handpicked selection of trending items
    </p>
  </div>
</div>


        {/* Category Filters */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "secondary"}
              size="sm"
              onClick={() => setActiveCategory(category)}
              className="shrink-0"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        
{products
  .filter((product) => {
    const matchesCategory =
      activeCategory === "All"
        ? true
        : product.category?.trim() === activeCategory;

    const matchesSearch =
      product.name
        ?.toLowerCase()
        .includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  })
  .slice(0, visibleProducts)
  .map((product) => (

    <ProductCard key={product.id} {...product} />
  ))}

</div>

        {/* Load More Button */}
       
{products.length > visibleProducts && (
  <div className="mt-12 flex justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="gap-2"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More Products"
            )}
          </Button>
        </div>
)}
    </div>
        
    </section>
  );
}
