export type DeliveredItem = {
  name: string;
  quantity: number;
  unit: string;
};

function normalizeItem(item: unknown): DeliveredItem | null {
  if (typeof item === "string" && item.trim()) {
    return { name: item.trim(), quantity: 1, unit: "item" };
  }

  if (item && typeof item === "object" && "name" in item) {
    const value = item as Partial<DeliveredItem>;
    if (typeof value.name !== "string" || !value.name.trim()) return null;

    return {
      name: value.name.trim(),
      quantity: typeof value.quantity === "number" && value.quantity > 0 ? value.quantity : 1,
      unit: typeof value.unit === "string" && value.unit.trim() ? value.unit.trim() : "item",
    };
  }

  return null;
}

/**
 * Accept either full JSON or a simple item list such as "[sugar, rice]".
 * Simple names are stored as one item each so the public impact page can
 * consistently show a quantity and unit.
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

  const items = values.map(normalizeItem);
  if (items.some((item) => !item)) {
    throw new Error("Each delivered item needs a name.");
  }

  return items as DeliveredItem[];
}
