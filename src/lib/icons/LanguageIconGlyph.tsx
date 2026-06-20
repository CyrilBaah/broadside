/**
 * Pure SVG glyph — no DOM APIs, so the same component renders identically in
 * the browser (icon picker, card preview) and inside satori's render tree
 * (the actual exported card image).
 */
export function LanguageIconGlyph({
  path,
  size = 24,
  color = "currentColor",
}: {
  path: string;
  size?: number;
  color?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d={path} fill={color} />
    </svg>
  );
}
