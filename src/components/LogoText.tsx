const LOGO_SIZES = {
  sm: { fontSize: "1.25rem" },
  xl: { fontSize: "3.25rem" },
} as const;

type LogoTextProps = {
  size: keyof typeof LOGO_SIZES;
  className?: string;
};

const LogoText = ({ size, className }: LogoTextProps) => (
  <span className={className} style={{ fontSize: LOGO_SIZES[size].fontSize, fontWeight: 600 }}>
    CodeReel
  </span>
);

export default LogoText;
