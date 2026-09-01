"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (!user) router.replace("/auth/login");
    });
  }, [router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    const { error } = await createClient().auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);

    toast.success("Password updated successfully");
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-earth-900 flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="card p-7 w-full max-w-sm space-y-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-earth-900">Choose a new password</h1>
          <p className="text-earth-500 text-sm mt-2">Use at least eight characters.</p>
        </div>
        <div>
          <label className="label">New password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
              autoComplete="new-password"
            />
            <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full flex justify-center gap-2">
          {loading && <Loader2 className="animate-spin" size={18} />}
          {loading ? "Updating password..." : "Update password"}
        </button>
      </form>
    </div>
  );
}
