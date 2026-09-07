"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ProgressBar
        height="3px"
        color="#2fa64f" /* earth-600 (logo green) */
        options={{ showSpinner: true }}
        shallowRouting
      />
    </>
  );
}
