const LOGO_SIZES = {
  sm: { fontSize: "1.25rem" },
  xl: { fontSize: "3.25rem" },
} as const;

type LogoTextProps = {
  size: keyof typeof LOGO_SIZES;
  className?: string;
};

const LogoMark = () => (
  <svg viewBox="3 7 26 18" aria-hidden="true" style={{ height: "0.8em", width: "auto" }}>
    <path
      d="M12 9.5 5.5 16l6.5 6.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16.5 10.2v11.6a1 1 0 0 0 1.5.86l9.3-5.8a1 1 0 0 0 0-1.72l-9.3-5.8a1 1 0 0 0-1.5.86Z"
      fill="currentColor"
    />
  </svg>
);

const LogoText = ({ size, className }: LogoTextProps) => (
  <span
    className={`inline-flex items-center gap-[0.4em] ${className ?? ""}`}
    style={{ fontSize: LOGO_SIZES[size].fontSize, fontWeight: 600 }}
  >
    <LogoMark />
    CodeReel
  </span>
);

export default LogoText;
