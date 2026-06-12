type LogoProps = {
  /** Height of the icon mark in px. Text scales relative to it. */
  size?: number;
  className?: string;
  /** Hide the wordmark text, show only the glowing A mark. */
  markOnly?: boolean;
};

/**
 * Recreated Action Plan Barbershop wordmark.
 * Glowing neon-yellow stylized "A" with an integrated scissors, followed by
 * white "ction plan" and the spaced "BARBERSHOP" label — matching the signage.
 */
export default function Logo({ size = 40, className = "", markOnly = false }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Action Plan Barbershop logo"
        className="shrink-0 drop-shadow-[0_0_10px_rgba(255,209,26,0.55)]"
      >
        {/* Stylized A: two legs + swooping crossbar */}
        <path
          d="M14 54 L30 12 C31 9 35 9 36 12 L52 54"
          stroke="#ffd11a"
          strokeWidth="5.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M20 40 C28 36 38 36 46 40"
          stroke="#ffd11a"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Integrated scissors at the apex */}
        <circle cx="27" cy="20" r="3.2" stroke="#ffe35c" strokeWidth="2" fill="none" />
        <circle cx="38" cy="20" r="3.2" stroke="#ffe35c" strokeWidth="2" fill="none" />
        <path
          d="M29.6 22.2 L40 33 M35.4 22.2 L25 33"
          stroke="#ffe35c"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {!markOnly && (
        <span className="flex flex-col leading-none">
          <span
            className="font-display font-black italic tracking-tight text-cream"
            style={{ fontSize: size * 0.62 }}
          >
            <span className="text-neon-yellow glow-text-yellow not-italic">A</span>
            ction plan
          </span>
          <span
            className="eyebrow text-cream-dim"
            style={{ fontSize: size * 0.2, marginTop: size * 0.05 }}
          >
            Barbershop
          </span>
        </span>
      )}
    </span>
  );
}
