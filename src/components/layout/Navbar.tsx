"use client";
// src/components/layout/Navbar.tsx
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const NAV_LINKS = [
  { href: "/campaigns", label: "Campaigns" },
  { href: "/impact", label: "Impact" },
  { href: "/about", label: "About" },
];

export default function Navbar({ user }: { user?: { email: string; role?: string } | null }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-earth-200/60 bg-sand-50/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-xl font-bold text-earth-700">
            My Akhirah Project
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="btn-ghost text-earth-700">
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {user.role === "admin" && (
                <Link href="/admin" className="btn-ghost text-xs">Admin Panel</Link>
              )}
              <Link href="/dashboard" className="btn-ghost">Dashboard</Link>
              <button onClick={handleSignOut} className="btn-secondary text-sm">Sign out</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="btn-ghost">Sign in</Link>
              <Link href="/campaigns" className="btn-primary">Invest Now</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-earth-100 bg-sand-50 px-4 py-4 space-y-2">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="block py-2 text-earth-700" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-earth-100 flex flex-col gap-2">
            {user ? (
              <>
                <Link href="/dashboard" className="btn-secondary w-full text-center" onClick={() => setOpen(false)}>Dashboard</Link>
                <button onClick={handleSignOut} className="btn-ghost w-full">Sign out</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="btn-secondary w-full text-center" onClick={() => setOpen(false)}>Sign in</Link>
                <Link href="/campaigns" className="btn-primary w-full text-center" onClick={() => setOpen(false)}>Invest Now</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
