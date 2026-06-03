"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LayoutDashboard,
  ArrowLeft,
  Users,
  Package,
  DollarSign,
  TrendingUp,
  Search,
  MoreHorizontal,
  Eye,
  Ban,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  onSnapshot,
} from "firebase/firestore";
import { deleteDoc } from "firebase/firestore";
import { updateDoc } from "firebase/firestore";


type TabType = "users" | "products";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
const [products, setProducts] = useState<any[]>([]);
const [orders, setOrders] = useState<any[]>([]);

  const handleAction = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
      case "Approved":
        return <CheckCircle className="h-4 w-4 text-accent" />;
      case "Suspended":
      case "Rejected":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "Pending":
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return null;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Active":
      case "Approved":
        return "bg-accent/10 text-accent";
      case "Suspended":
      case "Rejected":
        return "bg-destructive/10 text-destructive";
      case "Pending":
        return "bg-amber-500/10 text-amber-600";
      default:
        return "bg-secondary text-muted-foreground";
    }
  };

useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(db, "users"),
    (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(data);
    }
  );

  return () => unsubscribe();
}, []);
useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(db, "products"),
    (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProducts(data);
    }
  );

  return () => unsubscribe();
}, []);
useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(db, "orders"),
    (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setOrders(data);
    }
  );

  return () => unsubscribe();
}, []);

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
   if (!user) {
  router.push("/admin-login");
  return;
}

    const snap = await getDoc(doc(db, "users", user.uid));

   if (!snap.exists()) {
  router.push("/admin-login");
  return;
}


   const role = snap.data().role;

if (role !== "admin") {
  router.push("/");
  return;
}


    
  });

  return () => unsubscribe();
}, [router]);
const totalUsers = users.length;

const totalProducts = products.length;
const totalOrders = orders.length;
const filteredProducts = products.filter((product) =>
  product.name?.toLowerCase().includes(searchQuery.toLowerCase())
);
const filteredUsers = users.filter(
  (user) =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
);
const totalSellers = users.filter(
  (user) => user.role === "seller"
).length;
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-backdrop--filter:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Link>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-semibold text-foreground">Admin Dashboard</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-foreground">
  {totalUsers}
</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                <span className="text-accent">+234</span> this week
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold text-foreground">
  {totalProducts}
</p>

                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                  <Package className="h-6 w-6 text-foreground" />
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                <span className="text-accent">+1,234</span> this week
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground"> Total Orders</p>
                  <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <Package className="h-6 w-6 text-accent" />
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                <span className="text-accent">+18%</span> from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sellers</p>
                  <p className="text-2xl font-bold text-foreground">{totalSellers}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Monthly active users
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex gap-2">
            <Button
              variant={activeTab === "users" ? "default" : "secondary"}
              onClick={() => setActiveTab("users")}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              Users
            </Button>
            <Button
              variant={activeTab === "products" ? "default" : "secondary"}
              onClick={() => setActiveTab("products")}
              className="gap-2"
            >
              <Package className="h-4 w-4" />
              Products
            </Button>
          </div>
          
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Users Table */}
        {activeTab === "users" && (
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage all registered users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">User</th>
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground hidden sm:table-cell">Role</th>
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground hidden md:table-cell">Joined</th>
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground hidden lg:table-cell">Products</th>
                      <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user:any) => (
                      <tr key={user.id} className="border-b border-border last:border-0">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                              <span className="text-sm font-medium text-foreground">
                                {user.name?.split(" ").map((n: string) => n[0]).join("")}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 hidden sm:table-cell">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.role === "seller"
                              ? "bg-primary/10 text-primary" 
                              : "bg-secondary text-muted-foreground"
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusStyle(user.status || "Active")}`}>
                            {getStatusIcon(user.status || "Active")}
                            {user.status || "Active"}
                          </span>
                        </td>
                        <td className="py-4 text-muted-foreground hidden md:table-cell">{user.createdAt?.toDate().toLocaleDateString()}</td>
                        <td className="py-4 text-foreground hidden lg:table-cell">{
  products.filter(
    (product) => product.sellerId === user.id
  ).length
}</td>
                        <td className="py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                {isLoading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <MoreHorizontal className="h-4 w-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={handleAction} className="gap-2">
                                <Eye className="h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
  onClick={async () => {
    await updateDoc(
      doc(db, "users", user.id),
      {
        status:
          user.status === "Suspended"
            ? "Active"
            : "Suspended",
      }
    );
  }}
  className="gap-2"
>
  <Ban className="h-4 w-4" />
  {user.status === "Suspended" ? "Unsuspend" : "Suspend"}
</DropdownMenuItem>
                             <DropdownMenuItem
  onClick={async () => {
    await deleteDoc(doc(db, "users", user.id));
  }}
  className="gap-2 text-destructive"
>
  <Trash2 className="h-4 w-4" />
  Delete
</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products Table */}
        {activeTab === "products" && (
          <Card>
            <CardHeader>
              <CardTitle>Product Management</CardTitle>
              <CardDescription>Review and manage all product listings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Product</th>
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground hidden sm:table-cell">Seller</th>
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Price</th>
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                      <th className="pb-3 text-left text-sm font-medium text-muted-foreground hidden lg:table-cell">Category</th>
                      <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product:any) => (
                      <tr key={product.id} className="border-b border-border last:border-0">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                              <img
  src={product.image}
  alt={product.name}
  className="h-10 w-10 rounded object-cover"
/>
                            </div>
                            <span className="font-medium text-foreground line-clamp-1">{product.name}</span>
                          </div>
                        </td>
                        <td className="py-4 text-muted-foreground hidden sm:table-cell">{product.seller}</td>
                        <td className="py-4 text-foreground">₹{Number(product.price).toLocaleString("en-IN")}</td>
                        <td className="py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusStyle(product.status || "Pending")}`}>
                            {getStatusIcon(product.status || "Pending")}
                            {product.status || "Pending"}
                          </span>
                        </td>
                        <td className="py-4 text-muted-foreground hidden lg:table-cell">{product.category}</td>
                        <td className="py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                {isLoading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <MoreHorizontal className="h-4 w-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={handleAction} className="gap-2">
                                <Eye className="h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {product.status === "Pending" && (
                                <>
                                  <DropdownMenuItem
  onClick={async () => {
    await updateDoc(
      doc(db, "products", product.id),
      {
        status: "Approved",
      }
    );
  }}
  className="gap-2 text-accent"
>
  <CheckCircle className="h-4 w-4" />
  Approve
</DropdownMenuItem>
                                  <DropdownMenuItem
  onClick={async () => {
    await updateDoc(
      doc(db, "products", product.id),
      {
        status: "Rejected",
      }
    );
  }}
  className="gap-2 text-destructive"
>
  <XCircle className="h-4 w-4" />
  Reject
</DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem
  onClick={async () => {
    await deleteDoc(doc(db, "products", product.id));
  }}
  className="gap-2 text-destructive"
>
  <Trash2 className="h-4 w-4" />
  Delete
</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
