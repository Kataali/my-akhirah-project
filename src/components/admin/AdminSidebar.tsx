"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  Users,
  FileText,
  LogOut,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";
import SubmitButton from "@/components/ui/SubmitButton";

const ADMIN_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: ChevronLeft },
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/admin/investors", label: "Investors", icon: Users },
  { href: "/admin/reports", label: "Impact Reports", icon: FileText },
];

export default function AdminSidebar({ email }: { email?: string | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile sidebar when navigating to a new route
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname?.startsWith(href);
  };

  const sidebarContent = (
    <>
      <div className="px-5 py-5 border-b border-earth-700 flex items-center justify-between">
        <div>
          <p className="font-display text-sm font-bold text-white">
            My Akhira Foundation
          </p>
          <p className="text-xs text-earth-400 mt-0.5">Admin Panel</p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="md:hidden text-earth-400 hover:text-white p-1 rounded-md focus:outline-none"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
                active
                  ? "bg-earth-700 text-white font-medium"
                  : "text-earth-300 hover:text-white hover:bg-earth-700"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-earth-700">
        <p className="text-xs text-earth-400 truncate mb-3">{email}</p>
        <form action="/api/auth/logout" method="POST">
          <SubmitButton
            className="flex items-center gap-2 text-xs text-earth-400 hover:text-white transition-colors bg-transparent border-none p-0 h-auto w-auto focus:outline-none"
            loadingText="Signing out..."
          >
            <LogOut size={14} /> Sign out
          </SubmitButton>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header Bar */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between bg-earth-900 text-white px-4 py-3.5 border-b border-earth-700">
        <div>
          <p className="font-display text-sm font-bold text-white leading-tight">
            My Akhira Foundation
          </p>
          <p className="text-[11px] text-earth-400">Admin Panel</p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="p-2 rounded-lg text-earth-200 hover:text-white hover:bg-earth-800 transition-colors focus:outline-none"
          aria-label="Toggle admin sidebar"
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-Over Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-earth-900 text-white flex flex-col transform transition-transform duration-200 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Static Sidebar */}
      <aside className="hidden md:flex md:w-60 bg-earth-900 text-white flex-col shrink-0">
        {sidebarContent}
      </aside>
    </>
  );
}

