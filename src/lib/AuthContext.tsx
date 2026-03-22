"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface AppUser {
  uid: string;
  email: string | null;
  role: "admin" | "client";
  fullName?: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch role from Firestore with a 5s timeout to prevent infinite hang when DB is missing
        try {
          const fetchPromise = getDoc(doc(db, "users", firebaseUser.uid));
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout ao conectar com Firestore")), 5000));
          
          const userDoc = await Promise.race([fetchPromise, timeoutPromise]) as any;
          const docData = userDoc.data();
          let role = docData?.role || "client";
          
          if (firebaseUser.email?.toLowerCase() === "willdbga@gmail.com") {
             role = "admin";
          }
          
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: role as "admin" | "client",
            fullName: docData?.full_name || firebaseUser.displayName || "",
          });
        } catch (e: any) {
          console.error("Error fetching user data", e.message);
          // Fallback to basic user if DB fails
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: firebaseUser.email?.toLowerCase() === "willdbga@gmail.com" ? "admin" : "client"
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
