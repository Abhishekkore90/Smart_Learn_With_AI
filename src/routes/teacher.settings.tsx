import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";
import { TeacherHeader } from "@/components/teacher/TeacherHeader";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import {
  Save,
  User,
  Phone,
  BookOpen,
  FileText,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/teacher/settings")({
  component: TeacherSettings,
});

function TeacherSettings() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    subjects: "",
    bio: "",
    photoURL: "",
  });

  useEffect(() => {
    if (!authLoading) {
      if (sessionStorage.getItem("is_super_admin")) {
        setLoading(false);
        return;
      }
      if (!user || profile?.role !== "teacher") {
        navigate({
          to: "/login",
          search: { redirect: "/teacher/settings", role: "teacher" } as any,
        });
        return;
      }
      fetchUserData();
    }
  }, [user, profile, authLoading, navigate]);

  const fetchUserData = async () => {
    if (!user) return;
    try {
      // Trying teachers collection first
      let docRef = doc(db, "teachers", user.uid);
      let docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // Fallback to users collection
        docRef = doc(db, "users", user.uid);
        docSnap = await getDoc(docRef);
      }

      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData({
          fullName: data.fullName || user.displayName || "",
          phone: data.phone || "",
          subjects: data.subjects || "",
          bio: data.bio || "",
          photoURL: data.photoURL || (user as any).photoURL || "",
        });
      } else {
        setFormData((prev) => ({ ...prev, fullName: user.displayName || "" }));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      // Update or create in 'teachers' collection to keep it clean
      const docRef = doc(db, "teachers", user.uid);

      await setDoc(
        docRef,
        {
          ...formData,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">
            Loading Profile...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50">
      <TeacherHeader />
      <TeacherSidebar />

      <main className="lg:pl-64 pt-20 lg:pt-24 min-h-screen pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Profile Settings
            </h1>
            <p className="text-slate-500 mt-1">
              Manage your public educator profile and personal information.
            </p>
          </div>

          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 sm:p-10">
              <form onSubmit={handleSave} className="space-y-8">
                {/* Profile Photo Area */}
                <div className="flex items-center gap-6 pb-8 border-b border-slate-100">
                  <div className="relative size-24 sm:size-32 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {formData.photoURL ? (
                      <img
                        src={formData.photoURL}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="size-12 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-bold text-slate-900">
                      Profile Picture
                    </h3>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ImageIcon className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="url"
                        name="photoURL"
                        value={formData.photoURL}
                        onChange={handleChange}
                        placeholder="https://example.com/your-photo.jpg"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Provide a direct URL to your photo. Square images work
                      best.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <User className="size-4 text-indigo-500" /> Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      placeholder="John Doe"
                    />
                  </div>

                  {/* Email (Readonly) */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                    />
                    <p className="text-[10px] text-slate-400">
                      Email cannot be changed directly.
                    </p>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Phone className="size-4 text-indigo-500" /> Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      placeholder="+91 9876543210"
                    />
                  </div>

                  {/* Subjects */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <BookOpen className="size-4 text-indigo-500" /> Subjects
                      Taught
                    </label>
                    <input
                      type="text"
                      name="subjects"
                      value={formData.subjects}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      placeholder="e.g. Mathematics, Physics"
                    />
                  </div>

                  {/* Bio */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <FileText className="size-4 text-indigo-500" /> About Me
                      (Bio)
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y"
                      placeholder="Write a short biography about your teaching experience and methodology..."
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="size-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save className="size-4" /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
