"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loadingText?: string;
}

export default function SubmitButton({
  children,
  loadingText = "Please wait...",
  className = "btn-primary",
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || props.disabled}
      className={`${className} flex items-center justify-center gap-2`}
      {...props}
    >
      {pending ? (
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
