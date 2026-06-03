"use client";
export const dynamic = "force-dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Package,
  Truck,
  PackageCheck,
  Home,
  ShoppingBag,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";


const trackingSteps = [
  {
    id: 1,
    label: "Order Placed",
    icon: ShoppingBag,
    completed: true,
    current: false,
    date: "Mar 31, 2026",
  },
  {
    id: 2,
    label: "Packed",
    icon: Package,
    completed: true,
    current: false,
    date: "Mar 31, 2026",
  },
  {
    id: 3,
    label: "Shipped",
    icon: Truck,
    completed: false,
    current: true,
    date: "Expected Apr 1",
  },
  {
    id: 4,
    label: "Out for Delivery",
    icon: PackageCheck,
    completed: false,
    current: false,
    date: "Expected Apr 2",
  },
  {
    id: 5,
    label: "Delivered",
    icon: Home,
    completed: false,
    current: false,
    date: "Expected Apr 2",
  },
];

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const [orderData, setOrderData] = useState<any>(null);

    useEffect(() => {
    const fetchOrder = async () => {
      const orderId = searchParams.get("id");

      if (!orderId) return;

      const snap = await getDoc(doc(db, "orders", orderId));

      if (snap.exists()) {
        setOrderData({
          id: snap.id,
          ...snap.data(),
        });
      }
    };

    fetchOrder();
  }, []);
 
  if (!orderData) {
  return (
    <div className="p-10 text-center">
      Loading...
    </div>
  );
}
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="mx-auto max-w-3xl">
        {/* Success Section */}
        <Card className="mb-6 overflow-hidden">
          <CardContent className="flex flex-col items-center py-10 px-6 text-center">
            {/* Animated Success Icon */}
            <div className="relative mb-6">
              <div className="absolute inset-0 animate-ping rounded-full bg-accent/20" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-accent">
                <CheckCircle2 className="h-10 w-10 text-accent-foreground animate-[scale-in_0.3s_ease-out]" />
              </div>
            </div>

            <h1 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl text-balance">
              Order Placed Successfully!
            </h1>
            <p className="mb-6 text-muted-foreground max-w-md text-pretty">
              Your order has been confirmed and is being processed. We&apos;ll send you
              an email with tracking details shortly.
            </p>

            {/* Order Summary */}
            <div className="flex flex-col items-center gap-4 rounded-lg bg-secondary/50 px-8 py-4 sm:flex-row sm:gap-8">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-semibold text-foreground">{orderData.id}</p>
              </div>
              <Separator orientation="vertical" className="hidden h-10 sm:block" />
              <Separator className="w-20 sm:hidden" />
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-xl font-bold text-foreground">
                 ₹{orderData.total}
                </p>
              </div>
            </div>

            <Button asChild className="mt-6">
              <Link href="/">Continue Shopping</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Order Tracking Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Order Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Desktop Stepper */}
            <div className="hidden md:block">
              <div className="relative flex justify-between">
                {/* Progress Bar Background */}
                <div className="absolute left-0 right-0 top-5 h-1 bg-secondary">
                  {/* Progress Bar Fill */}
                  <div
                    className="h-full bg-accent transition-all duration-500"
                    style={{
                      width: `${
                        ((trackingSteps.findIndex((s) => s.current) + 0.5) /
                          (trackingSteps.length - 1)) *
                        100
                      }%`,
                    }}
                  />
                </div>

                {trackingSteps.map((step) => (
                  <div
                    key={step.id}
                    className="relative z-10 flex flex-col items-center"
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                        step.completed
                          ? "border-accent bg-accent text-accent-foreground"
                          : step.current
                          ? "border-accent bg-background text-accent"
                          : "border-border bg-background text-muted-foreground"
                      }`}
                    >
                      <step.icon className="h-5 w-5" />
                    </div>
                    <p
                      className={`mt-2 text-sm font-medium ${
                        step.completed || step.current
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{step.date}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Stepper */}
            <div className="md:hidden">
              <div className="relative">
                {trackingSteps.map((step, index) => (
                  <div key={step.id} className="flex items-start gap-4 pb-6 last:pb-0">
                    {/* Vertical Line */}
                    {index < trackingSteps.length - 1 && (
                      <div
                        className={`absolute left-5 ml-[-1px] h-full w-0.5 ${
                          step.completed ? "bg-accent" : "bg-border"
                        }`}
                        style={{
                          top: `${(index * 100) / trackingSteps.length + 5}%`,
                          height: `${100 / trackingSteps.length - 2}%`,
                        }}
                      />
                    )}

                    {/* Icon */}
                    <div
                      className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                        step.completed
                          ? "border-accent bg-accent text-accent-foreground"
                          : step.current
                          ? "border-accent bg-background text-accent"
                          : "border-border bg-background text-muted-foreground"
                      }`}
                    >
                      <step.icon className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-1">
                      <p
                        className={`font-medium ${
                          step.completed || step.current
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-sm text-muted-foreground">{step.date}</p>
                    </div>

                    {/* Status Badge */}
                    {step.current && (
                      <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                        In Progress
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Details Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {orderData.items.map((item: any) => (
                <div
                  key={item.productId || item.name}
                  className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                >
                  {/* Product Image */}
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-secondary sm:h-20 sm:w-20">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground line-clamp-2">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  {/* Price */}
                  <p className="shrink-0 font-semibold text-foreground">
                    ₹{Number(item.price).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            {/* Order Total */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium text-foreground">
                ₹{Number(orderData.total).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium text-accent">Free</span>
            </div>
            <Separator className="my-4" />
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-foreground">Total</span>
              <span className="text-lg font-bold text-foreground">
                 ₹{Number(orderData.total).toLocaleString("en-IN")}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home Link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
