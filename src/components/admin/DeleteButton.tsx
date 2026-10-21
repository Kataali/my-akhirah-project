"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteButtonProps {
  id: string;
  label?: string;
  confirmMessage?: string;
  deleteAction: (formData: FormData) => Promise<void>;
}

export default function DeleteButton({
  id,
  label = "Delete",
  confirmMessage = "Are you sure you want to delete this item? This cannot be undone.",
  deleteAction,
}: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(confirmMessage)) return;
    setIsDeleting(true);
    try {
      const formData = new FormData();
      formData.append("id", id);
      await deleteAction(formData);
    } catch (err: any) {
      alert(err?.message || "Failed to delete item.");
      setIsDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-800 disabled:opacity-50 transition-colors"
    >
      {isDeleting ? (
        <Loader2 size={13} className="animate-spin" />
      ) : (
        <Trash2 size={13} />
      )}
      {isDeleting ? "Deleting..." : label}
    </button>
  );
}
