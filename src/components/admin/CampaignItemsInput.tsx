"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Calculator } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { CampaignItemValue } from "@/lib/validations";

interface CampaignRowState {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  unit_cost_ghs: string;
}

interface CampaignItemsInputProps {
  value: CampaignItemValue[];
  onChange: (items: CampaignItemValue[]) => void;
  onApplyTotal?: (totalGhs: number) => void;
}

function makeRowId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function CampaignItemsInput({
  value,
  onChange,
  onApplyTotal,
}: CampaignItemsInputProps) {
  const [rows, setRows] = useState<CampaignRowState[]>(() => {
    if (Array.isArray(value) && value.length > 0) {
      return value.map((item) => ({
        id: makeRowId(),
        name: item.name ?? "",
        quantity: item.quantity ? String(item.quantity) : "1",
        unit: item.unit ?? "",
        unit_cost_ghs:
          typeof item.unit_cost_ghs === "number"
            ? String(item.unit_cost_ghs)
            : "",
      }));
    }
    return [
      { id: makeRowId(), name: "", quantity: "1", unit: "", unit_cost_ghs: "" },
    ];
  });

  // Sync valid rows upward whenever rows change
  useEffect(() => {
    const parsed: CampaignItemValue[] = rows
      .filter((r) => r.name.trim().length > 0)
      .map((r) => {
        const qty = Math.max(1, Number(r.quantity) || 1);
        const cost = Math.max(0, Number(r.unit_cost_ghs) || 0);
        return {
          name: r.name.trim(),
          quantity: qty,
          unit: r.unit.trim(),
          unit_cost_ghs: cost,
        };
      });
    onChange(parsed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      { id: makeRowId(), name: "", quantity: "1", unit: "", unit_cost_ghs: "" },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    setRows((prev) => {
      const next = prev.filter((r) => r.id !== id);
      return next.length > 0
        ? next
        : [
            {
              id: makeRowId(),
              name: "",
              quantity: "1",
              unit: "",
              unit_cost_ghs: "",
            },
          ];
    });
  };

  const handleChange = (
    id: string,
    field: keyof Omit<CampaignRowState, "id">,
    val: string
  ) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: val } : r))
    );
  };

  const grandTotal = rows.reduce((sum, r) => {
    if (!r.name.trim()) return sum;
    const qty = Math.max(0, Number(r.quantity) || 0);
    const cost = Math.max(0, Number(r.unit_cost_ghs) || 0);
    return sum + qty * cost;
  }, 0);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <label className="label mb-0">Items needed</label>
          <p className="text-xs text-earth-400 mt-0.5">
            Break down the items this campaign will purchase and their estimated
            unit cost in GHS.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddRow}
          className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1"
        >
          <Plus size={14} /> Add item
        </button>
      </div>

      <div className="space-y-2.5">
        {rows.map((row, idx) => {
          const qty = Math.max(0, Number(row.quantity) || 0);
          const cost = Math.max(0, Number(row.unit_cost_ghs) || 0);
          const lineTotal = qty * cost;

          return (
            <div
              key={row.id}
              className="rounded-lg border border-earth-200 bg-earth-50/40 p-3 space-y-2"
            >
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                <div className="sm:col-span-4">
                  <input
                    type="text"
                    value={row.name}
                    onChange={(e) =>
                      handleChange(row.id, "name", e.target.value)
                    }
                    placeholder="Item name (e.g. Water filter)"
                    aria-label={`Item ${idx + 1} name`}
                    className="input py-2 text-xs sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <input
                    type="number"
                    min="1"
                    value={row.quantity}
                    onChange={(e) =>
                      handleChange(row.id, "quantity", e.target.value)
                    }
                    placeholder="Qty"
                    aria-label={`Item ${idx + 1} quantity`}
                    className="input py-2 text-xs sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-3">
                  <input
                    type="text"
                    value={row.unit}
                    onChange={(e) =>
                      handleChange(row.id, "unit", e.target.value)
                    }
                    placeholder="Unit (optional, e.g. bags)"
                    aria-label={`Item ${idx + 1} unit`}
                    className="input py-2 text-xs sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={row.unit_cost_ghs}
                    onChange={(e) =>
                      handleChange(row.id, "unit_cost_ghs", e.target.value)
                    }
                    placeholder="Unit cost (GHS)"
                    aria-label={`Item ${idx + 1} unit cost`}
                    className="input py-2 text-xs sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(row.id)}
                    title="Remove item"
                    aria-label={`Remove item ${idx + 1}`}
                    className="p-2 rounded-md text-earth-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {row.name.trim() && (
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-earth-500 px-1">
                  <span>
                    {qty} {row.unit.trim() ? `${row.unit.trim()} of ` : ""}
                    {row.name.trim()} @ {formatCurrency(cost)} each
                  </span>
                  <span className="font-semibold text-earth-700">
                    Subtotal: {formatCurrency(lineTotal)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {grandTotal > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-earth-100/70 px-3.5 py-2.5 text-xs">
          <span className="font-semibold text-earth-800">
            Estimated Items Total: {formatCurrency(grandTotal)}
          </span>
          {onApplyTotal && (
            <button
              type="button"
              onClick={() => onApplyTotal(grandTotal)}
              className="inline-flex items-center gap-1.5 font-semibold text-earth-700 hover:text-earth-900 underline"
            >
              <Calculator size={13} /> Set as Target Amount
            </button>
          )}
        </div>
      )}
    </div>
  );
}

