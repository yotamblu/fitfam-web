import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "volt" | "game";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-ember text-canvas hover:brightness-110",
  volt: "bg-volt text-canvas hover:brightness-110",
  secondary: "bg-white/[0.07] text-text-primary hover:bg-white/[0.11]",
  ghost: "text-text-secondary hover:bg-white/[0.06] hover:text-text-primary",
  // the chunky glossy button of the roadmap world (white rim, hard bottom edge that squashes when pressed)
  game: "border-[3px] border-white/85 bg-gradient-to-b from-[#ff8a5c] to-[#ec4a1f] text-white [text-shadow:0_2px_0_rgba(0,0,0,0.3)] shadow-[0_6px_0_#8f2a10] active:translate-y-[4px] active:shadow-[0_2px_0_#8f2a10] hover:brightness-110",
};

const SIZES: Record<Size, string> = {
  sm: "h-10 px-4 text-body-md",
  md: "h-11 px-5 text-body-md",
  lg: "h-12 px-6 text-body-lg",
};

/** Class names for a FitFam button; use on <Link> for navigation buttons. */
export function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth = false,
}: {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
} = {}): string {
  return [
    "inline-flex items-center justify-center gap-2 font-heading font-bold transition duration-200 ease-out",
    variant === "game" ? "rounded-full" : "rounded-xl",
    "active:scale-[0.985] disabled:pointer-events-none disabled:opacity-60",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember",
    VARIANTS[variant],
    SIZES[size],
    fullWidth ? "w-full" : "",
  ].join(" ");
}

export default function Button({
  variant,
  size,
  fullWidth,
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; fullWidth?: boolean }) {
  return <button type={type} className={`${buttonClasses({ variant, size, fullWidth })} ${className}`} {...props} />;
}
