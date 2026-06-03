"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";


export default function BuyerHero() {
  const banners = [
    "/banner1.jpeg",
    "/banner2.jpeg",
    "/banner3.jpeg",
  ];

  const [current, setCurrent] = useState(0);

  // auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);
const scroll = (direction: "left" | "right") => {
  const container = document.getElementById("recommended-scroll");

  if (container) {
    container.scrollBy({
      left: direction === "left" ? -300 : 300,
      behavior: "smooth",
    });
  }
};
  return (
    <div className="w-full">

      {/* ================= HERO ================= */}
      <section className="relative w-full h-95 sm:h-105 lg:h-120 overflow-hidden">
        
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8"
          alt="Fashion Banner"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/60" />

        <div className="absolute inset-0 flex items-center">
          <div className="px-6 sm:px-10 lg:px-16 max-w-xl text-white">
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
              Minimal Style. <br /> Maximum Impact.
            </h1>

            <p className="mt-3 text-sm sm:text-base text-white/80">
              Discover curated fashion & lifestyle essentials
            </p>


          </div>
        </div>
      </section>


      {/* ================= DEALS SLIDER ================= */}
      <section className="mt-6 px-4 sm:px-6 lg:px-10">
  <div className="relative w-full h-60 sm:h-70 lg:h-80 overflow-hidden rounded-xl">

    {/* Images */}
    {banners.map((img, index) => (
      <img
        key={index}
        src={img}
        alt="deal banner"
        className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ${
          index === current ? "opacity-100" : "opacity-0"
        }`}
      />
    ))}

    {/* Dark overlay */}
    <div className="absolute inset-0 bg-black/40" />

    {/* Text */}
    <div className="absolute inset-0 flex items-center px-6 sm:px-10">
      <div className="text-white max-w-md">
        <h2 className="text-xl sm:text-3xl font-semibold">
          Mega Deals
        </h2>
        <p className="mt-2 text-sm sm:text-base text-white/80">
          Up to 60% off on selected items
        </p>
      </div>
    </div>

  </div>
</section>

      {/* ================= RECOMMENDED ================= */}
      <section className="mt-8 px-4 sm:px-6 lg:px-10">
        
        <h2 className="text-lg sm:text-xl font-semibold mb-4">
          Recommended for you
        </h2>

        <div className="relative">

  {/* LEFT BUTTON */}
  <button
    onClick={() => scroll("left")}
    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2"
  >
    <ChevronLeft className="w-5 h-5" />
  </button>

  {/* RIGHT BUTTON */}
  <button
    onClick={() => scroll("right")}
    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2"
  >
    <ChevronRight className="w-5 h-5" />
  </button>

  {/* SCROLL AREA */}
  <div
    id="recommended-scroll"
    className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide px-10 pb-2"
  >
          
          {[
            {
              name: "Jewellery Sets",
              image:
                "https://images.unsplash.com/photo-1617038220319-276d3cfab638",
            },
            {
              name: "Televisions",
              image:
                "https://images.unsplash.com/photo-1593784991095-a205069470b6",
            },
            {
              name: "Curtains",
              image:
               "https://images.unsplash.com/photo-1513694203232-719a280e022f",
            },
            {
              name: "Shoes",
              image:
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
            },
{
  name: "Watches",
  image:
    "https://images.unsplash.com/photo-1523170335258-f5ed11844a49",
},
 {
  name: "Headphones",
  image:
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
},
{
  name: "Handbags",
  image:
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3",
},
{
  name: "Sunglasses",
  image:
    "https://images.unsplash.com/photo-1511499767150-a48a237f0083",
},
{
  name: "Perfumes",
  image:
    "https://images.unsplash.com/photo-1541643600914-78b084683601",
},
{
  name: "Gaming",
  image:
    "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3",
},
{
  name: "Smartphones",
  image:
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
},
{
  name: "Laptops",
  image:
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
},
{
  name: "Makeup",
  image:
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9",
},
{
  name: "Furniture",
  image:
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
},
{
  name: "Backpacks",
  image:
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
},
{
  name: "Fitness",
  image:
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
},
{
  name: "Kitchen",
  image:
    "https://images.unsplash.com/photo-1556911220-bff31c812dba",
},
{
  name: "Skincare",
  image:
    "https://images.unsplash.com/photo-1556228578-8c89e6adf883",
},
{
  name: "Books",
  image:
    "https://images.unsplash.com/photo-1512820790803-83ca734da794",
},

  
          ].map((item, i) => (
            <div
              key={i}
              className="min-w-35 sm:min-w-40 bg-white rounded-xl overflow-hidden shadow-sm"
            >
              <img
                src={item.image}
                className="w-full h-30 object-cover"
              />
              <div className="p-2">
                <p className="text-sm font-medium">{item.name}</p>
                <button className="text-xs text-gray-500 mt-1">
                  View Store
                </button>
              </div>
            </div>
          ))}

        </div>
        </div>
      </section>

    </div>
    
  );
}