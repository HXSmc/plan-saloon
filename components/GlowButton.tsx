import { ComponentPropsWithoutRef } from "react";

type Variant = "solid" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

type GlowButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: Variant;
  size?: Size;
};

const base =
  "inline-flex items-center justify-center font-label font-semibold uppercase tracking-widest rounded-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal-deep disabled:opacity-40 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  solid:
    "bg-neon-yellow text-charcoal-deep hover:bg-neon-glow hover:shadow-glow-yellow-lg shadow-glow-yellow",
  outline:
    "border border-neon-yellow/60 text-neon-yellow hover:border-neon-yellow hover:shadow-glow-yellow",
  ghost: "text-cream-dim hover:text-cream",
};

const sizes: Record<Size, string> = {
  sm: "text-xs px-4 py-2",
  md: "text-sm px-6 py-3",
  lg: "text-base px-8 py-4",
};

export default function GlowButton({
  variant = "solid",
  size = "md",
  className = "",
  ...props
}: GlowButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
