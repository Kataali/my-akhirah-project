"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);

    const { error } = await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
    });

    setLoading(false);
    if (error) return toast.error(error.message);
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-earth-900 flex items-center justify-center px-4">
      <div className="card p-7 w-full max-w-sm">
        <h1 className="font-display text-2xl font-bold text-earth-900">Reset your password</h1>
        <p className="text-earth-500 text-sm mt-2">We’ll send a secure reset link to your email address.</p>
        {sent ? (
          <p className="mt-6 rounded-lg bg-green-50 p-4 text-sm text-green-800">Check your inbox for the password-reset link.</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex justify-center gap-2">
              {loading && <Loader2 className="animate-spin" size={18} />}
              {loading ? "Sending reset link..." : "Send reset link"}
            </button>
          </form>
        )}
        <Link href="/auth/login" className="block mt-5 text-center text-sm text-earth-600 underline">Back to sign in</Link>
      </div>
    </div>
  );
}
