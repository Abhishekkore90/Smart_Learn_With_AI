import { useState, useEffect, createContext, useContext } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface UserProfile {
  fullName: string;
  role: "teacher" | "student" | "admin" | "uploader";
  usid?: string;
  email: string;
  class?: string;
  [key: string]: any;
}

interface AuthContextType {
  user:
    | User
    | null
    | {
        email: string;
        uid: string;
        displayName: string;
        photoURL?: string | null;
      };
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for hardcoded Super Admin session
    const isSuperAdmin = sessionStorage.getItem("is_super_admin");
    if (isSuperAdmin === "true") {
      setUser({
        email: "superadmin123@gmail.com",
        uid: "superadmin-fix",
        displayName: "Super Admin",
      });
      setProfile({
        fullName: "Super Admin",
        role: "admin",
        email: "superadmin123@gmail.com",
      });
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoading(true);
        setUser(user);
        try {
          // Try to fetch from 'teachers' collection first, then 'users' (students)
          const teacherDoc = await getDoc(doc(db, "teachers", user.uid));
          if (teacherDoc.exists()) {
            setProfile({
              ...teacherDoc.data(),
              role: "teacher",
            } as UserProfile);
          } else {
            const studentDoc = await getDoc(doc(db, "users", user.uid));
            if (studentDoc.exists()) {
              const data = studentDoc.data();
              setProfile({
                ...data,
                role: data.role || "student",
              } as UserProfile);
            } else {
              // Fallback for showcase if document doesn't exist
              console.warn(
                "No Firestore document found. Using fallback profile.",
              );
              setProfile({
                fullName: user.displayName || "Demo User",
                role: "teacher",
                email: user.email || "",
              });
            }
          }
        } catch (error) {
          console.error(
            "Failed to fetch user profile (possible Firestore Rules issue):",
            error,
          );
          // Fallback for showcase if Firestore fails (e.g. missing permissions)
          setProfile({
            fullName: user.displayName || "Demo User",
            role: "teacher",
            email: user.email || "",
          });
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
