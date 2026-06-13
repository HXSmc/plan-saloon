import { ComponentPropsWithoutRef } from "react";
import Link from "next/link";

type Variant = "solid" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

// The glow is the brand element from the storefront sign — it lives on the
// primary (solid) action only. Everything else stays quiet.
const base =
  "inline-flex items-center justify-center gap-2 font-label font-semibold uppercase tracking-widest rounded-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal-deep disabled:opacity-40 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  solid:
    "bg-neon-yellow text-charcoal-deep hover:bg-neon-glow shadow-glow-yellow hover:shadow-glow-yellow-lg",
  outline:
    "border border-neon-yellow/60 text-neon-yellow hover:border-neon-yellow hover:bg-neon-yellow/10",
  ghost: "text-cream-dim hover:text-cream",
};

const sizes: Record<Size, string> = {
  sm: "text-xs px-4 py-2",
  md: "text-sm px-6 py-3",
  lg: "text-base px-8 py-4",
};

function cls(variant: Variant, size: Size, className: string) {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`;
}

type GlowButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: Variant;
  size?: Size;
};

export default function GlowButton({
  variant = "solid",
  size = "md",
  className = "",
  ...props
}: GlowButtonProps) {
  return <button className={cls(variant, size, className)} {...props} />;
}

type GlowLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: Variant;
  size?: Size;
};

/** Link styled identically to GlowButton — for navigation CTAs. */
export function GlowLink({
  variant = "solid",
  size = "md",
  className = "",
  ...props
}: GlowLinkProps) {
  return <Link className={cls(variant, size, className)} {...props} />;
}
