"use client";

import { useEffect, useRef } from "react";

const MIN_WIDTH = 200; // Google's allowed button width range
const MAX_WIDTH = 400;

/**
 * Lays Google's own (real) sign-in button invisibly over the styled button underneath it, so the visible design stays
 * ours while the click goes to Google, which is the only way to receive an ID token. Place inside a `relative`
 * parent whose visible button is `aria-hidden`; Google's button supplies the accessible control.
 */
export default function GoogleButtonOverlay({
  ready,
  text,
}: {
  ready: boolean;
  text: "signin_with" | "signup_with" | "continue_with";
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const target = buttonRef.current;
    const google = window.google;
    if (!ready || !wrap || !target || !google) return;

    const width = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(wrap.getBoundingClientRect().width)));
    google.accounts.id.renderButton(target, {
      type: "standard",
      theme: "outline",
      size: "large",
      shape: "pill",
      text,
      locale: "he",
      width,
    });
    return () => target.replaceChildren();
  }, [ready, text]);

  return (
    // Almost (not fully) transparent: browsers still deliver clicks, and the underlying design shows through.
    <div
      ref={wrapRef}
      dir="ltr"
      className="absolute inset-0 overflow-hidden rounded-full opacity-[0.01]"
    >
      {/* Google's button is 40px tall; the visible button is 48px. Stretch it so the whole area is clickable. */}
      <div
        ref={buttonRef}
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 scale-y-120"
      />
    </div>
  );
}
