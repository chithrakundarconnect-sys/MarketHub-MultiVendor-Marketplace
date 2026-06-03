"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import {
  Store,
  Loader2,
  ArrowLeft,
  Upload,
  Package,
  TrendingUp,
  ShoppingBag,
  Plus,
  Image as ImageIcon,
  X,
  Sparkles,
} from "lucide-react";
import { db, auth } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useEffect } from "react";
import { getDocs } from "firebase/firestore";
import { updateDoc, doc } from "firebase/firestore";
import { deleteDoc } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { query, where, getDoc} from "firebase/firestore";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { toast } from "sonner";


export default function SellerDashboard() {
  const router = useRouter();
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productCategory, setProductCategory] = useState("");
 const [productImages, setProductImages] = useState<File[]>([]);
const [previews, setPreviews] = useState<string[]>([]);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [products, setProducts] = useState<any[]>([]);
  // ✅ ADD HERE
const totalProducts = products.length;

const totalSales = products.reduce(
  (sum, product) => sum + (product.sales || 0),
  0
);

const totalRevenue = products.reduce(
  (sum, product) =>
    sum + (product.price * (product.sales || 0)),
  0
);

const revenueData = products.map((product) => ({
  name: product.name,
  revenue: product.price * (product.sales || 0),
}));


useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (!user) {
      router.push("/login");
      return;
    }

    const snap = await getDoc(doc(db, "users", user.uid));

    if (!snap.exists()) {
      router.push("/login");
      return;
    }

    const role = snap.data().role;

    if (role !== "seller") {
      router.push("/");
    }
  });

  return () => unsubscribe();
}, [router]);

useEffect(() => {
  let unsubscribeProducts: (() => void) | undefined;

  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (unsubscribeProducts) {
      unsubscribeProducts();
      unsubscribeProducts = undefined;
    }

    if (!user) {
      setProducts([]);
      return;
    }

    const q = query(
      collection(db, "products"),
      where("sellerId", "==", user.uid)
    );

    unsubscribeProducts = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProducts(data);
      },
      (error) => {
        console.error("Seller products listener error:", error);
        if (unsubscribeProducts) {
          unsubscribeProducts();
          unsubscribeProducts = undefined;
        }
      }
    );
  });

  return () => {
    if (unsubscribeProducts) unsubscribeProducts();
    unsubscribeAuth();
  };
}, []);


useEffect(() => {
  return () => {
    previews.forEach((url) =>
      URL.revokeObjectURL(url)
    );
  };
}, [previews]);

const handleImageUpload = (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const files = Array.from(e.target.files || []);

  if (files.length === 0) return;

  const selectedFiles = files.slice(0, 4);

  setProductImages(selectedFiles);

  const urls = selectedFiles.map((file) =>
    URL.createObjectURL(file)
  );

  setPreviews(urls);
};

  const handleGenerateAIDescription = async () => {
    if (!productName.trim()) return;
    setIsGeneratingAI(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const descriptions = [
      `Introducing the ${productName} – a premium quality product designed with attention to detail and crafted for excellence. This exceptional item combines innovative features with elegant design, making it the perfect choice for discerning customers who value both style and functionality. Built to last with high-quality materials, it offers outstanding performance and reliability you can count on.`,
      `Discover the ${productName}, where quality meets sophistication. Meticulously designed to exceed expectations, this product features premium craftsmanship and modern aesthetics. Whether for personal use or as a thoughtful gift, it delivers exceptional value and an unparalleled experience that will leave a lasting impression.`,
      `Elevate your experience with the ${productName}. This carefully curated product showcases exceptional quality and timeless design. Every detail has been thoughtfully considered to ensure maximum satisfaction. Perfect for those who appreciate the finer things in life, it combines practicality with premium appeal.`,
    ];
    
    const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
    setProductDescription(randomDescription);
    setIsGeneratingAI(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const user = auth.currentUser;
    if (!user) {
    toast.error("User not logged in");
      return;
    }

if (productImages.length === 0) {
 toast.warning("Please select at least one image");
 setIsLoading(false);
  return;
}

   const imageUrls: string[] = [];

for (const image of productImages) {
  const response = await fetch(
   `/api/s3-upload?file=${image.name}&type=${image.type}`
  );

  const data = await response.json();

  await fetch(data.signedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": image.type,
    },
    body: image,
  });

  imageUrls.push(data.imageUrl);
}


    // 🔥 2. Save to Firestore
    await addDoc(collection(db, "products"), {
      name: productName,
      price: Number(productPrice),
      description: productDescription,
     images: imageUrls,
     image: imageUrls[0], // ✅ AWS URL
      category: productCategory, // ✅ ADD THIS
      sellerId: user.uid,
      createdAt: serverTimestamp(),
      status: "Active",
      sales: 0,
    });

   toast.success("Product added successfully");

    // reset
    setProductName("");
    setProductPrice("");
    setProductDescription("");
    setProductCategory("");
    setProductImages([]);
    setPreviews([]);
    setShowAddProduct(false);

  } catch (error) {
    console.error(error);
   toast.error("Error adding product");
  }

  setIsLoading(false);
};

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
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
                  <Store className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-semibold text-foreground">Seller Dashboard</span>
              </div>
            </div>
            <Button onClick={() => setShowAddProduct(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Product</span>
            </Button>
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
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                 <p className="text-2xl font-bold text-foreground">
  ₹{totalRevenue.toLocaleString("en-IN")}
</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                  <span className="text-accent text-xl font-bold">₹</span>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                <span className="text-accent">+12%</span> from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold text-foreground">
  {totalSales}
</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                <span className="text-accent">+8%</span> from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Products</p>
                  <p className="text-2xl font-bold text-foreground">
  {totalProducts}
</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                  <Package className="h-6 w-6 text-foreground" />
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                2 pending review
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conversion</p>
                 <p className="text-2xl font-bold text-foreground">
  {products.length > 0
    ? Math.round((totalSales / products.length) * 100)
    : 0}
%
</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                <span className="text-accent">+0.5%</span> from last week
              </p>
            </CardContent>
          </Card>
        </div>

<Card className="mb-8">
  <CardHeader>
    <CardTitle>Revenue Analytics</CardTitle>
    <CardDescription>
      Revenue generated by products
    </CardDescription>
  </CardHeader>

  <CardContent>
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={revenueData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#22c55e"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </CardContent>
</Card>
        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Products</CardTitle>
            <CardDescription>Manage and track your product listings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Product</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Price</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Sales</th>
                    <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                {products.map((product) => (
                    <tr key={product.id} className="border-b border-border last:border-0">
                      <td className="py-4">
  <div className="flex items-center gap-2">
     {product.image ? (
      <img
        src={product.image}
        className="h-10 w-10 rounded object-cover"
      />
    ) : (
      <Package className="h-5 w-5 text-muted-foreground" />
    )}

    <span className="font-medium text-foreground">
      {product.name || "No Name"}
    </span>
  </div>
</td>
                      <td className="py-4 text-foreground">₹{Number(product.price).toLocaleString("en-IN")}</td>
                      <td className="py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          product.status === "Active"
                            ? "bg-accent/10 text-accent"
                            : "bg-secondary text-muted-foreground"
                        }`}>
                          {product.status || "Active"}
                        </span>
                      </td>
                      <td className="py-4 text-foreground">{product.sales || 0}</td>
                      
<td className="py-4 text-right flex gap-2 justify-end">
  <Button
    variant="ghost"
    size="sm"
    onClick={() => setEditingProduct(product)}
  >
    Edit
  </Button>

  <Button
    variant="destructive"
    size="sm"
    onClick={async () => {
  await deleteDoc(doc(db, "products", product.id));
}}
  >
    Delete
  </Button>
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowAddProduct(false)}
          />
          <Card className="relative z-10 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Add New Product</CardTitle>
                  <CardDescription>Fill in the details to list your product</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAddProduct(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload */}
                <Field>
                  <FieldLabel>Product Image</FieldLabel>
                  <div className="mt-1">
                    {previews.length > 0 ? (
  <>
    <div className="grid grid-cols-2 gap-3">
      {previews.map((img, index) => (
        <div key={index} className="relative">
          <img
            src={img}
            alt={`Preview ${index}`}
            className="h-32 w-full object-cover rounded-lg"
          />

          <button
            type="button"
            onClick={() => {
              const updatedPreviews = previews.filter(
                (_, i) => i !== index
              );

              const updatedImages = productImages.filter(
                (_, i) => i !== index
              );

              setPreviews(updatedPreviews);
              setProductImages(updatedImages);
            }}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
          >
            ×
          </button>
        </div>
      ))}
    </div>

    {productImages.length < 4 && (
      <label className="block mt-3 cursor-pointer text-blue-600 font-medium">
        + Add More Images

        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);

            const newFiles = [
              ...productImages,
              ...files,
            ].slice(0, 4);

            setProductImages(newFiles);

            const urls = newFiles.map((file) =>
              URL.createObjectURL(file)
            );

            setPreviews(urls);
          }}
        />
      </label>
    )}
  </>
) : (
                      <label className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/50 hover:bg-secondary transition-colors">
                        <div className="flex flex-col items-center">
                          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-background">
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <p className="text-sm font-medium text-foreground">
                            Click to upload image
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PNG, JPG up to 10MB
                          </p>
                        </div>
                        <input
  type="file"
  accept="image/*"
  multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </Field>

                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="product-name">Product Name</FieldLabel>
                    <Input
                      id="product-name"
                      placeholder="Enter product name"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="product-description">Product Description</FieldLabel>
                    <div className="mb-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateAIDescription}
                        disabled={isGeneratingAI || !productName.trim()}
                        className="gap-2"
                      >
                        {isGeneratingAI ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            Generate AI Description
                          </>
                        )}
                      </Button>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        Use AI to quickly generate high-quality product descriptions
                      </p>
                    </div>
                    <Textarea
                      id="product-description"
                      placeholder="AI will generate a professional product description..."
                      value={productDescription}
                      onChange={(e) => setProductDescription(e.target.value)}
                      rows={4}
                      required
                    />
                  </Field>
                  <Field>
  <FieldLabel>Category</FieldLabel>
  <select
    value={productCategory}
    onChange={(e) => setProductCategory(e.target.value)}
    className="w-full border rounded-md p-2"
    required
  >
    <option value="">Select Category</option>
    <option value="Electronics">Electronics</option>
    <option value="Fashion">Fashion</option>
    <option value="Home & Living">Home & Living</option>
    <option value="Sports">Sports</option>
    <option value="Beauty">Beauty</option>
  </select>
</Field>

                  <Field>
                    <FieldLabel htmlFor="product-price">Price</FieldLabel>
                    <div className="relative">
                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
  ₹
</span>
                      <Input
                        id="product-price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="₹0"
                        value={productPrice}
                        onChange={(e) => setProductPrice(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </Field>

                  </FieldGroup>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowAddProduct(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 gap-2" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Add Product
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
      {editingProduct && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div
      className="absolute inset-0 bg-background/80 backdrop-blur-sm"
      onClick={() => setEditingProduct(null)}
    />

    <Card className="relative z-10 w-full max-w-lg mx-4">
      <CardHeader>
        <CardTitle>Edit Product</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <Input
          value={editingProduct.name}
          onChange={(e) =>
            setEditingProduct({
              ...editingProduct,
              name: e.target.value,
            })
          }
        />

        <Input
          type="number"
          value={editingProduct.price}
          onChange={(e) =>
            setEditingProduct({
              ...editingProduct,
              price: Number(e.target.value),
            })
          }
        />

        <Textarea
          value={editingProduct.description}
          onChange={(e) =>
            setEditingProduct({
              ...editingProduct,
              description: e.target.value,
            })
          }
        />

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditingProduct(null)}>
            Cancel
          </Button>

         <Button
  onClick={async () => {
    await updateDoc(doc(db, "products", editingProduct.id), {
      name: editingProduct.name,
      price: editingProduct.price,
      description: editingProduct.description,
    });

   toast.success("Product updated successfully");

    setEditingProduct(null);

    
  }}
>
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
)}
    </div>
  );
}