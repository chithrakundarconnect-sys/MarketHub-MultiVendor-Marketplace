import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, TrendingUp, Shield } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Left Content */}
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-foreground w-fit">
              <Sparkles className="h-4 w-4 text-accent" />
              Trusted by 10,000+ sellers worldwide
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
              Your Gateway to{" "}
              <span className="text-accent">Global Commerce</span>
            </h1>
            
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
              Discover unique products from verified sellers around the world. 
              Join our marketplace to buy or sell with confidence.
            </p>
            
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/signup">
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  Start Selling
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                Browse Products
              </Button>
            </div>
            
            {/* Stats */}
            <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-2xl font-bold text-foreground">50K+</p>
                <p className="text-sm text-muted-foreground">Active Products</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">10K+</p>
                <p className="text-sm text-muted-foreground">Trusted Sellers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">99%</p>
                <p className="text-sm text-muted-foreground">Satisfaction</p>
              </div>
            </div>
          </div>
          
          {/* Right Content - Feature Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-card-foreground">Secure Payments</h3>
              <p className="text-sm text-muted-foreground">
                All transactions are protected with enterprise-grade encryption.
              </p>
            </div>
            
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
                <TrendingUp className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-card-foreground">Grow Your Business</h3>
              <p className="text-sm text-muted-foreground">
                Access tools and analytics to scale your online store.
              </p>
            </div>
            
            <div className="col-span-full rounded-2xl border border-border bg-secondary/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">New sellers this month</p>
                  <p className="text-3xl font-bold text-foreground">+2,847</p>
                </div>
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-10 w-10 rounded-full border-2 border-background bg-muted"
                    />
                  ))}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-primary text-xs font-medium text-primary-foreground">
                    +99
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
