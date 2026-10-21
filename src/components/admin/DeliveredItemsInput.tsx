"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { formatDeliveredItem, type DeliveredItem } from "@/lib/report-items";

interface ItemRow {
  id: string;
  quantity: string;
  unit: string;
  name: string;
}

interface DeliveredItemsInputProps {
  name?: string;
  defaultItems?: Array<{
    name?: string;
    quantity?: number | null;
    unit?: string | null;
  }> | null;
}

function makeRowId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function DeliveredItemsInput({
  name = "items_delivered",
  defaultItems = [],
}: DeliveredItemsInputProps) {
  const [rows, setRows] = useState<ItemRow[]>(() => {
    if (defaultItems && defaultItems.length > 0) {
      return defaultItems.map((item) => ({
        id: makeRowId(),
        quantity:
          typeof item.quantity === "number" && item.quantity > 0
            ? String(item.quantity)
            : "",
        unit: item.unit?.trim() ?? "",
        name: item.name?.trim() ?? "",
      }));
    }
    return [{ id: makeRowId(), quantity: "", unit: "", name: "" }];
  });

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      { id: makeRowId(), quantity: "", unit: "", name: "" },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    setRows((prev) => {
      const next = prev.filter((row) => row.id !== id);
      return next.length > 0
        ? next
        : [{ id: makeRowId(), quantity: "", unit: "", name: "" }];
    });
  };

  const handleChange = (
    id: string,
    field: keyof Omit<ItemRow, "id">,
    value: string
  ) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const serializedItems: DeliveredItem[] = rows
    .filter((r) => r.name.trim().length > 0)
    .map((r) => {
      const item: DeliveredItem = { name: r.name.trim() };
      const qty = Number(r.quantity);
      if (r.quantity.trim() !== "" && !Number.isNaN(qty) && qty > 0) {
        item.quantity = qty;
      }
      if (r.unit.trim() !== "") {
        item.unit = r.unit.trim();
      }
      return item;
    });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <label className="label mb-0">Items delivered</label>
          <p className="text-xs text-earth-400 mt-0.5">
            Leave <strong>Unit</strong> blank for items like{" "}
            <span className="italic">&ldquo;50 wall clocks&rdquo;</span>, or
            fill it for <span className="italic">&ldquo;20 packs of pens&rdquo;</span>.
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

      <input
        type="hidden"
        name={name}
        value={JSON.stringify(serializedItems)}
      />

      <div className="space-y-2.5">
        {rows.map((row, idx) => {
          const qtyNum = Number(row.quantity);
          const previewText = row.name.trim()
            ? formatDeliveredItem({
                name: row.name,
                quantity:
                  row.quantity.trim() !== "" && !Number.isNaN(qtyNum) && qtyNum > 0
                    ? qtyNum
                    : undefined,
                unit: row.unit,
              })
            : null;

          return (
            <div
              key={row.id}
              className="rounded-lg border border-earth-200 bg-earth-50/40 p-3 space-y-2"
            >
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                <div className="sm:col-span-2">
                  <input
                    type="number"
                    min="1"
                    value={row.quantity}
                    onChange={(e) =>
                      handleChange(row.id, "quantity", e.target.value)
                    }
                    placeholder="Qty (e.g. 50)"
                    aria-label={`Item ${idx + 1} quantity`}
                    className="input py-2 text-xs sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-4">
                  <input
                    type="text"
                    value={row.unit}
                    onChange={(e) =>
                      handleChange(row.id, "unit", e.target.value)
                    }
                    placeholder="Unit (optional, e.g. packs, bags)"
                    aria-label={`Item ${idx + 1} unit`}
                    className="input py-2 text-xs sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-5">
                  <input
                    type="text"
                    value={row.name}
                    onChange={(e) =>
                      handleChange(row.id, "name", e.target.value)
                    }
                    placeholder="Item name (e.g. wall clocks, pens)"
                    aria-label={`Item ${idx + 1} name`}
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

              {previewText && (
                <p className="text-[11px] text-earth-500 pl-1">
                  Displays as:{" "}
                  <span className="font-semibold text-earth-700">
                    · {previewText}
                  </span>
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
