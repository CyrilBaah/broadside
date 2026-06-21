import styles from "./DriftBackdrop.module.css";

const SAGE = "oklch(78% 0.16 150 / 0.85)";
const BLUSH = "oklch(82% 0.14 350 / 0.9)";
const PERIWINKLE = "oklch(72% 0.16 270 / 0.8)";
const GOLD = "oklch(80% 0.18 75 / 0.8)";

type Keyframe = "a" | "b" | "c" | "d";

interface ShapeConfig {
  type: "square" | "rect" | "diamond";
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  width: number;
  height: number;
  color: string;
  keyframe: Keyframe;
  duration: number;
  delay: number;
  hideOnMobile?: boolean;
}

/**
 * Squares, rectangles, and diamonds scattered around both edges of the
 * stage, clear of the centered intro copy (and, on the editor screen,
 * mostly occluded by the opaque preview/options panels — only the slivers
 * outside the 1240px content column show through there). Reuses 4 drift
 * paths across many shapes via varied duration/delay rather than a unique
 * keyframe per shape, so the set can grow without the CSS growing with it.
 */
const SHAPES: ShapeConfig[] = [
  { type: "square", top: "9%", left: "7%", width: 190, height: 190, color: SAGE, keyframe: "a", duration: 14, delay: 0 },
  { type: "rect", bottom: "11%", right: "9%", width: 230, height: 290, color: PERIWINKLE, keyframe: "b", duration: 18, delay: -4, hideOnMobile: true },
  { type: "square", top: "15%", right: "16%", width: 92, height: 92, color: BLUSH, keyframe: "c", duration: 11, delay: -2 },
  { type: "rect", bottom: "17%", left: "13%", width: 250, height: 144, color: GOLD, keyframe: "d", duration: 16, delay: -6, hideOnMobile: true },
  { type: "diamond", top: "42%", right: "4%", width: 88, height: 88, color: GOLD, keyframe: "c", duration: 13, delay: -3, hideOnMobile: true },
  { type: "square", top: "5%", left: "42%", width: 64, height: 64, color: BLUSH, keyframe: "a", duration: 12, delay: -5, hideOnMobile: true },
  { type: "diamond", top: "6%", right: "42%", width: 56, height: 56, color: SAGE, keyframe: "c", duration: 15, delay: -1, hideOnMobile: true },
  { type: "rect", top: "55%", left: "3%", width: 96, height: 150, color: PERIWINKLE, keyframe: "d", duration: 17, delay: -8, hideOnMobile: true },
  { type: "square", bottom: "30%", right: "23%", width: 70, height: 70, color: GOLD, keyframe: "b", duration: 14, delay: -7, hideOnMobile: true },
  { type: "diamond", bottom: "7%", left: "32%", width: 68, height: 68, color: SAGE, keyframe: "a", duration: 16, delay: -3, hideOnMobile: true },
  { type: "rect", bottom: "4%", left: "40%", width: 160, height: 88, color: BLUSH, keyframe: "b", duration: 19, delay: -9, hideOnMobile: true },
  { type: "square", top: "30%", left: "2%", width: 76, height: 76, color: PERIWINKLE, keyframe: "c", duration: 10, delay: -2, hideOnMobile: true },
  { type: "diamond", bottom: "42%", right: "1%", width: 60, height: 60, color: BLUSH, keyframe: "d", duration: 14, delay: -5, hideOnMobile: true },

  // Top edge, clear of the header (left) and the intro copy below.
  { type: "square", top: "6%", left: "18%", width: 50, height: 50, color: PERIWINKLE, keyframe: "a", duration: 11, delay: -1, hideOnMobile: true },
  { type: "diamond", top: "7%", left: "28%", width: 44, height: 44, color: GOLD, keyframe: "b", duration: 13, delay: -3, hideOnMobile: true },
  { type: "rect", top: "6%", right: "58%", width: 60, height: 40, color: SAGE, keyframe: "c", duration: 15, delay: -5, hideOnMobile: true },
  { type: "square", top: "8%", right: "32%", width: 56, height: 56, color: BLUSH, keyframe: "d", duration: 17, delay: -7, hideOnMobile: true },
  { type: "diamond", top: "5%", right: "22%", width: 48, height: 48, color: PERIWINKLE, keyframe: "a", duration: 19, delay: -2, hideOnMobile: true },
  { type: "square", top: "7%", right: "12%", width: 64, height: 64, color: GOLD, keyframe: "b", duration: 12, delay: -4, hideOnMobile: true },
  { type: "rect", top: "9%", right: "2%", width: 50, height: 70, color: SAGE, keyframe: "c", duration: 14, delay: -6, hideOnMobile: true },

  // Bottom edge.
  { type: "diamond", bottom: "5%", left: "8%", width: 46, height: 46, color: GOLD, keyframe: "d", duration: 16, delay: -8, hideOnMobile: true },
  { type: "square", bottom: "6%", left: "22%", width: 58, height: 58, color: BLUSH, keyframe: "a", duration: 18, delay: -1, hideOnMobile: true },
  { type: "rect", bottom: "4%", right: "58%", width: 70, height: 46, color: PERIWINKLE, keyframe: "b", duration: 10, delay: -3, hideOnMobile: true },
  { type: "diamond", bottom: "7%", right: "30%", width: 54, height: 54, color: SAGE, keyframe: "c", duration: 13, delay: -5, hideOnMobile: true },
  { type: "square", bottom: "5%", right: "16%", width: 48, height: 48, color: GOLD, keyframe: "d", duration: 15, delay: -7, hideOnMobile: true },

  // Left edge.
  { type: "square", top: "5%", left: "2%", width: 44, height: 44, color: BLUSH, keyframe: "a", duration: 17, delay: -2, hideOnMobile: true },
  { type: "diamond", top: "82%", left: "3%", width: 50, height: 50, color: PERIWINKLE, keyframe: "b", duration: 19, delay: -4, hideOnMobile: true },
  { type: "rect", top: "94%", left: "1%", width: 56, height: 40, color: GOLD, keyframe: "c", duration: 11, delay: -6, hideOnMobile: true },

  // Right edge.
  { type: "rect", top: "12%", right: "1%", width: 44, height: 64, color: SAGE, keyframe: "d", duration: 14, delay: -8, hideOnMobile: true },
  { type: "square", top: "78%", right: "2%", width: 52, height: 52, color: BLUSH, keyframe: "a", duration: 16, delay: -1, hideOnMobile: true },
  { type: "diamond", top: "92%", right: "3%", width: 46, height: 46, color: PERIWINKLE, keyframe: "b", duration: 18, delay: -3, hideOnMobile: true },
];

const KEYFRAME_CLASS: Record<Keyframe, string> = {
  a: styles.kfA,
  b: styles.kfB,
  c: styles.kfC,
  d: styles.kfD,
};

export function DriftBackdrop() {
  return (
    <div className={styles.backdrop} aria-hidden="true">
      {SHAPES.map((shape, index) => {
        const position = {
          top: shape.top,
          left: shape.left,
          right: shape.right,
          bottom: shape.bottom,
          width: shape.width,
          height: shape.height,
        };
        const animation = {
          animationDuration: `${shape.duration}s`,
          animationDelay: `${shape.delay}s`,
        };
        const className = [
          styles.shape,
          KEYFRAME_CLASS[shape.keyframe],
          shape.hideOnMobile ? styles.hideOnMobile : null,
        ]
          .filter(Boolean)
          .join(" ");

        if (shape.type === "diamond") {
          return (
            <span key={index} className={className} style={{ ...position, ...animation }}>
              <span className={styles.diamondInner} style={{ background: shape.color }} />
            </span>
          );
        }

        return (
          <span
            key={index}
            className={className}
            style={{ ...position, ...animation, background: shape.color }}
          />
        );
      })}
    </div>
  );
}
