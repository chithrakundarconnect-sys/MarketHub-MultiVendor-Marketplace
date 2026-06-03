"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";



export default function ProfilePage() {
  const [userData, setUserData] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
const [editName, setEditName] = useState(userData?.name || "");
const [editPhone, setEditPhone] = useState(userData?.phone || "");
  const [newAddress, setNewAddress] = useState({
  fullName: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
});
  const router = useRouter();

  const handleLogout = async () => {
  await signOut(auth);
  router.push("/login");
};

const handleAddAddress = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const updated = [
    ...addresses,
    {
      ...newAddress,
      id: Date.now().toString(),
      isDefault: addresses.length === 0,
    },
  ];

  const docRef = doc(db, "users", user.uid);

  await updateDoc(docRef, {
    addresses: updated,
  });

  setAddresses(updated);

  setNewAddress({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });
};


const handleSetDefault = async (id: string) => {
  const user = auth.currentUser;
  if (!user) return;

  const updated = addresses.map((addr) => ({
    ...addr,
    isDefault: addr.id === id,
  }));

  const docRef = doc(db, "users", user.uid);

  await updateDoc(docRef, { addresses: updated });
  setAddresses(updated);
};

const handleDeleteAddress = async (id: string) => {
  const user = auth.currentUser;
  if (!user) return;

  let updated = addresses.filter((addr) => addr.id !== id);

  if (updated.length > 0 && !updated.some(a => a.isDefault)) {
    updated[0].isDefault = true;
  }

  const docRef = doc(db, "users", user.uid);

  await updateDoc(docRef, { addresses: updated });
  setAddresses(updated);
};


  useEffect(() => {
    let unsubscribeOrders: any;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
  const data = docSnap.data();

  // 🚀 ADD THIS
  if (data.role === "admin") {
    router.push("/admin");
    return;
  }

  setUserData(data);

  if (data.addresses) {
    setAddresses(data.addresses);
  }
  if (user) {

  const ordersQuery = query(
    collection(db, "orders"),
    where("userId", "==", user.uid),
    orderBy("createdAt", "desc"),
    limit(2)
  );

  unsubscribeOrders = onSnapshot(
    ordersQuery,
    (snapshot) => {

      const ordersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setRecentOrders(ordersData);

    },
    (error) => {
      console.log(error);
    }
  );

}
}

      } else {
        // 🔒 if not logged in → redirect to login
        router.push("/login");
      }
    });

    return () => {
  unsubscribe();

  if (unsubscribeOrders) {
    unsubscribeOrders();
  }
};
  }, [router]);

 
  if (!userData) return <p>Loading...</p>;
  const handleUpdateProfile = async () => {
  const user = auth.currentUser;
  if (!user) return;

  await updateDoc(doc(db, "users", user.uid), {
    name: editName,
    phone: editPhone,
  });

  setUserData({
    ...userData,
    name: editName,
    phone: editPhone,
  });

  setShowEditProfile(false);
};
 return (
  <>
    <div className="min-h-screen bg-gray-100 py-6 px-4">

    
<div className="max-w-3xl mx-auto space-y-6">

  {/* BACK BUTTON */}
  <button
    onClick={() => router.push("/")}
    className="flex items-center gap-2 text-gray-600 hover:text-black transition"
  >
    <ArrowLeft className="w-4 h-4" />
    Back to Home
  </button>

        {/* PROFILE HEADER */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border">

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
              {userData.name?.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                {userData.name}
              </h2>

              <p className="text-gray-500 text-sm">
                {userData.email}
              </p>
            </div>
          </div>

        </div>

        {/* QUICK ACTIONS */}
        {userData.role !== "seller" && (
        <div className="grid grid-cols-2 gap-4">

          <Link href="/orders">
            <div className="bg-white border rounded-2xl p-5 hover:shadow-md transition cursor-pointer">
              <p className="text-3xl mb-2">📦</p>

              <h3 className="font-semibold text-lg">
                Orders
              </h3>

              <p className="text-sm text-gray-500">
                Track your orders
              </p>
            </div>
          </Link>

          <Link href="/wishlist">
            <div className="bg-white border rounded-2xl p-5 hover:shadow-md transition cursor-pointer">
              <p className="text-3xl mb-2">❤️</p>

              <h3 className="font-semibold text-lg">
                Wishlist
              </h3>

              <p className="text-sm text-gray-500">
                Saved items
              </p>
            </div>
          </Link>

          <div className="bg-white border rounded-2xl p-5 hover:shadow-md transition cursor-pointer">
            <p className="text-3xl mb-2">📍</p>

            <h3 className="font-semibold text-lg">
              Addresses
            </h3>

            <p className="text-sm text-gray-500">
              Manage addresses
            </p>
          </div>

          <div className="bg-white border rounded-2xl p-5 hover:shadow-md transition cursor-pointer">
            <p className="text-3xl mb-2">📞</p>

            <h3 className="font-semibold text-lg">
              Help Center
            </h3>

            <p className="text-sm text-gray-500">
              Contact support
            </p>
          </div>

        </div>
        )}

        {/* ACCOUNT SETTINGS */}
         {userData.role !== "seller" && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border">

          <h2 className="text-xl font-semibold mb-5">
            Account Settings
          </h2>

          <div className="space-y-5">

            <div
  onClick={() => setShowEditProfile(true)}
  className="flex justify-between items-center cursor-pointer"
>
              <div>
                <p className="font-medium">
                  Edit Profile
                </p>

                <p className="text-sm text-gray-500">
                  Update your details
                </p>
              </div>

              <span className="text-gray-400 text-xl">›</span>
            </div>

         
            </div>

        </div>
)}
        {/* MY ACTIVITY */}
         {userData.role !== "seller" && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border">

          <h2 className="text-xl font-semibold mb-5">
            My Activity
          </h2>

          <div className="space-y-5">

            <Link href="/wishlist">
              <div className="flex justify-between items-center cursor-pointer">

                <div>
                  <p className="font-medium">
                    ❤️ Wishlist
                  </p>

                  <p className="text-sm text-gray-500">
                    View saved products
                  </p>
                </div>

                <span className="text-gray-400 text-xl">›</span>

              </div>
            </Link>

            <Link href="/orders">
              <div className="flex justify-between items-center cursor-pointer">

                <div>
                  <p className="font-medium">
                    📦 Recent Orders
                  </p>

                  <p className="text-sm text-gray-500">
                    Track recent purchases
                  </p>
                </div>

                <span className="text-gray-400 text-xl">›</span>

              </div>
            </Link>

          </div>
        </div>
)}
        {/* ADDRESS SECTION */}
         {userData.role !== "seller" && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border">

          <div className="flex items-center justify-between mb-5">

            <h2 className="text-xl font-semibold">
              My Addresses
            </h2>

            <button
              onClick={() => setShowForm(true)}
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-xl"
            >
              + Add
            </button>

          </div>

          {addresses.length === 0 && (
            <p className="text-gray-500 text-sm">
              No addresses added
            </p>
          )}

          <div className="space-y-4">

            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="border rounded-2xl p-4"
              >

                <div className="flex justify-between">

                  <div>
                    <p className="font-semibold">
                      {addr.fullName}
                    </p>

                    <p className="text-sm text-gray-600">
                      {addr.phone}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="text-red-500 text-sm"
                  >
                    Delete
                  </button>

                </div>

                <p className="text-sm text-gray-700 mt-3">
                  {addr.street}, {addr.city}
                </p>

                <p className="text-sm text-gray-700">
                  {addr.state} - {addr.pincode}
                </p>

                {addr.isDefault && (
                  <span className="inline-block mt-3 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    Default Address
                  </span>
                )}

              </div>
            ))}

          </div>

          {/* FORM */}
          {showForm && (
            <div className="mt-6 border-t pt-5 space-y-3">

              <input
                placeholder="Full Name"
                value={newAddress.fullName}
                onChange={(e) =>
                  setNewAddress({
                    ...newAddress,
                    fullName: e.target.value,
                  })
                }
                className="w-full border p-3 rounded-xl"
              />

              <input
                placeholder="Phone"
                value={newAddress.phone}
                onChange={(e) =>
                  setNewAddress({
                    ...newAddress,
                    phone: e.target.value,
                  })
                }
                className="w-full border p-3 rounded-xl"
              />

              <input
                placeholder="Street"
                value={newAddress.street}
                onChange={(e) =>
                  setNewAddress({
                    ...newAddress,
                    street: e.target.value,
                  })
                }
                className="w-full border p-3 rounded-xl"
              />

              <input
                placeholder="City"
                value={newAddress.city}
                onChange={(e) =>
                  setNewAddress({
                    ...newAddress,
                    city: e.target.value,
                  })
                }
                className="w-full border p-3 rounded-xl"
              />

              <input
                placeholder="State"
                value={newAddress.state}
                onChange={(e) =>
                  setNewAddress({
                    ...newAddress,
                    state: e.target.value,
                  })
                }
                className="w-full border p-3 rounded-xl"
              />

              <input
                placeholder="Pincode"
                value={newAddress.pincode}
                onChange={(e) =>
                  setNewAddress({
                    ...newAddress,
                    pincode: e.target.value,
                  })
                }
                className="w-full border p-3 rounded-xl"
              />

              <div className="flex gap-3 pt-2">

                <button
                  onClick={handleAddAddress}
                  className="bg-blue-600 text-white px-5 py-2 rounded-xl"
                >
                  Save
                </button>

                <button
                  onClick={() => setShowForm(false)}
                  className="bg-gray-200 px-5 py-2 rounded-xl"
                >
                  Cancel
                </button>

              </div>

            </div>
          )}
  
        </div>
         )}
         {showEditProfile && (
  <div className="bg-white rounded-3xl p-6 shadow-sm border">
    <h2 className="text-xl font-semibold mb-4">
      Edit Profile
    </h2>

    <input
      value={editName}
      onChange={(e) => setEditName(e.target.value)}
      placeholder="Name"
      className="w-full border p-3 rounded-xl mb-3"
    />

    <input
      value={editPhone}
      onChange={(e) => setEditPhone(e.target.value)}
      placeholder="Phone Number"
      className="w-full border p-3 rounded-xl mb-3"
    />

    <button
      onClick={handleUpdateProfile}
      className="bg-blue-600 text-white px-5 py-2 rounded-xl"
    >
      Save Changes
    </button>
  </div>
)}
        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="w-full bg-white border border-red-200 text-red-500 py-4 rounded-2xl font-medium hover:bg-red-50 transition"
        >
          Logout
        </button>

      </div>

    </div>
  </>
);
}
