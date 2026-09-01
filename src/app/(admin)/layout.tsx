// @ts-nocheck
// src/app/(admin)/layout.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { LayoutDashboard, Megaphone, Users, FileText, LogOut, ChevronLeft } from "lucide-react";
import SubmitButton from "@/components/ui/SubmitButton";

const ADMIN_NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/admin/investors", label: "Investors", icon: Users },
  { href: "/admin/reports", label: "Impact Reports", icon: FileText },
];

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
    <div className="flex min-h-screen bg-earth-50">
      {/* Sidebar */}
      <aside className="w-60 bg-earth-900 text-white flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-earth-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-display text-sm font-bold text-white">My Akhirah Project</p>
              <p className="text-xs text-earth-400 mt-0.5">Admin Panel</p>
            </div>
            <Link href="/dashboard" className="flex items-center gap-2 text-xs text-earth-300 hover:text-white">
              <ChevronLeft size={14} />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {ADMIN_NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-earth-300 hover:text-white hover:bg-earth-700 transition-colors text-sm"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-earth-700">
          <p className="text-xs text-earth-400 truncate mb-3">{profile?.email}</p>
          <form action="/api/auth/logout" method="POST">
            <SubmitButton className="flex items-center gap-2 text-xs text-earth-400 hover:text-white transition-colors bg-transparent border-none p-0 h-auto w-auto focus:outline-none" loadingText="Signing out...">
              <LogOut size={14} /> Sign out
            </SubmitButton>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-auto">
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
