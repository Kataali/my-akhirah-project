"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loadingText?: string;
  isLoading?: boolean;
}

export default function SubmitButton({
  children,
  loadingText = "Please wait...",
  className = "btn-primary",
  isLoading = false,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const isActuallyLoading = pending || isLoading;

  return (
    <button
      type="submit"
      disabled={isActuallyLoading || props.disabled}
      className={`${className} flex items-center justify-center gap-2`}
      {...props}
    >
      {isActuallyLoading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
