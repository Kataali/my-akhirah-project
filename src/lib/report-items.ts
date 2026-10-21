export type DeliveredItem = {
  name: string;
  quantity?: number;
  unit?: string;
};

/**
 * Format a delivered item for display:
 * - { name: "pens", quantity: 20, unit: "packs" } -> "20 packs of pens"
 * - { name: "wall clocks", quantity: 50 }         -> "50 wall clocks"
 * - { name: "Rice" }                              -> "Rice"
 */
export function formatDeliveredItem(item: {
  name: string;
  quantity?: number | null;
  unit?: string | null;
}): string {
  const name = item.name?.trim() || "";
  const qty =
    typeof item.quantity === "number" && item.quantity > 0
      ? item.quantity
      : null;
  const unit = item.unit?.trim() || "";

  if (qty && unit) {
    return `${qty} ${unit} of ${name}`;
  }
  if (qty) {
    return `${qty} ${name}`;
  }
  return name;
}

function normalizeItem(item: unknown): DeliveredItem | null {
  if (typeof item === "string" && item.trim()) {
    return { name: item.trim() };
  }

  if (item && typeof item === "object" && "name" in item) {
    const value = item as {
      name?: unknown;
      quantity?: unknown;
      unit?: unknown;
    };
    if (typeof value.name !== "string" || !value.name.trim()) return null;

    const normalized: DeliveredItem = {
      name: value.name.trim(),
    };

    const parsedQty =
      typeof value.quantity === "number"
        ? value.quantity
        : typeof value.quantity === "string" && value.quantity.trim() !== ""
          ? Number(value.quantity)
          : undefined;

    if (typeof parsedQty === "number" && !Number.isNaN(parsedQty) && parsedQty > 0) {
      normalized.quantity = parsedQty;
    }

    if (typeof value.unit === "string" && value.unit.trim()) {
      normalized.unit = value.unit.trim();
    }

    return normalized;
  }

  return null;
}

/**
 * Accept either structured JSON (from the interactive row builder) or a simple
 * item list such as "[sugar, rice]".
 * Both `{ name, quantity, unit }` ("20 packs of pens") and `{ name, quantity }`
 * ("50 wall clocks") are supported.
 */
export function parseDeliveredItems(raw: string): DeliveredItem[] {
  const input = raw.trim();
  if (!input) return [];

  let values: unknown[];
  try {
    const parsed = JSON.parse(input);
    if (!Array.isArray(parsed)) throw new Error("Items must be a list");
    values = parsed;
  } catch {
    const list = input.replace(/^\[|\]$/g, "");
    values = list
      .split(/[,\n]/)
      .map((item) => item.trim().replace(/^['"]|['"]$/g, ""))
      .filter(Boolean);
  }

  const items = values.map(normalizeItem).filter((item): item is DeliveredItem => item !== null);
  return items;
}
