// @ts-nocheck
// src/app/(admin)/layout.tsx
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-earth-50">
      <AdminSidebar email={profile?.email} />

      {/* Main */}
      <div className="flex-1 overflow-x-hidden">
        <main className="p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
