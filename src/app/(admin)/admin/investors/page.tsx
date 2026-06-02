// src/app/(admin)/admin/investors/page.tsx
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function AdminInvestorsPage() {
  const supabase = createServerSupabaseClient();

  const { data: investors } = await supabase
    .from("profiles")
    .select(`
      id, full_name, email, created_at,
      contributions(amount, status, campaigns(title))
    `)
    .eq("role", "investor")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-earth-900">Investors</h1>
        <p className="text-earth-500 text-sm mt-1">{investors?.length ?? 0} registered investors</p>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-earth-100 bg-earth-50 text-left">
              <th className="px-5 py-3 text-xs font-semibold text-earth-500 uppercase tracking-wide">Investor</th>
              <th className="px-5 py-3 text-xs font-semibold text-earth-500 uppercase tracking-wide">Total contributed</th>
              <th className="px-5 py-3 text-xs font-semibold text-earth-500 uppercase tracking-wide">Contributions</th>
              <th className="px-5 py-3 text-xs font-semibold text-earth-500 uppercase tracking-wide">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-earth-50">
            {investors?.map((investor) => {
              const successfulContributions = (investor.contributions as { amount: number; status: string }[])
                ?.filter((c) => c.status === "success") ?? [];
              const total = successfulContributions.reduce((sum, c) => sum + c.amount, 0);

              return (
                <tr key={investor.id} className="hover:bg-earth-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-earth-800">{investor.full_name ?? "—"}</p>
                    <p className="text-xs text-earth-400">{investor.email}</p>
                  </td>
                  <td className="px-5 py-4 font-semibold text-earth-700">
                    {total > 0 ? formatCurrency(total) : <span className="text-earth-300">—</span>}
                  </td>
                  <td className="px-5 py-4 text-earth-500">{successfulContributions.length}</td>
                  <td className="px-5 py-4 text-earth-400 text-xs">{formatDate(investor.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!investors?.length && (
          <div className="py-16 text-center text-earth-400">No investors yet.</div>
        )}
      </div>
    </div>
  );
}
