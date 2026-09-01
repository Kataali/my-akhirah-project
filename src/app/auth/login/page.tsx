"use client";
// src/app/auth/login/page.tsx
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { safeRedirect } from "@/lib/auth";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string };
}) {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const redirect = safeRedirect(searchParams.redirect);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
        toast.success("Account created — please sign in with your credentials");
        setLoading(false);
        router.push("/auth/login?signup=success");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push(redirect);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-earth-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-2xl font-bold text-white">
            My Akhirah Project
          </Link>
          <p className="text-earth-300 text-sm mt-2">
            {mode === "login" ? "Welcome back" : "Join us and start investing in the hereafter"}
          </p>
        </div>

        <div className="card p-7">
          {/* Mode toggle */}
          <div className="flex rounded-lg overflow-hidden border border-earth-200 mb-6">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 text-sm font-medium transition-colors capitalize ${
                  mode === m ? "bg-earth-500 text-white" : "text-earth-500 hover:bg-earth-50"
                }`}
              >
                {m === "login" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <label className="label">Password</label>
                {mode === "login" && (
                  <Link href="/auth/forgot-password" className="text-xs text-earth-600 underline">
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <div>
                <label className="label">Confirm password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 mt-2">
              {loading && <Loader2 className="animate-spin" size={18} />}
              {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="text-center text-xs text-earth-400 mt-5">
            By continuing, you agree to our{" "}
            <Link href="/privacy" className="underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
