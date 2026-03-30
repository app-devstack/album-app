'use client';

/**
 * 思い出帳 アプリアイコン
 * デザイン: 開いたフォトアルバムのシルエットに桜の花びらをあしらった独自SVG
 * - 外枠: 丸みのある正方形（アルバム表紙）
 * - 中央線: 開いたページのスパイン
 * - 左右ページ: 写真を示す小さな矩形
 * - 上部: 桜の花（五弁）
 */

interface AppIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function AppIcon({ size = 24, className, style }: AppIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      style={style}
    >
      {/* アルバム背景 — 丸みのある正方形 */}
      <rect
        x="2"
        y="5"
        width="32"
        height="26"
        rx="4.5"
        fill="currentColor"
        fillOpacity="0.12"
      />
      <rect
        x="2"
        y="5"
        width="32"
        height="26"
        rx="4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {/* スパイン（中央の綴じ目） */}
      <line
        x1="18"
        y1="7"
        x2="18"
        y2="29"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeDasharray="2 2"
      />

      {/* 左ページ — 写真フレーム小 */}
      <rect
        x="5.5"
        y="11"
        width="9.5"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.3"
        fillOpacity="0"
      />
      {/* 左ページ — 山の景色線 */}
      <polyline
        points="5.5,16.5 8,13.5 10.5,15.5 13,12.5 15,14.5"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.7"
      />

      {/* 右ページ — 写真フレーム小 */}
      <rect
        x="21"
        y="11"
        width="9.5"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.3"
        fillOpacity="0"
      />
      {/* 右ページ — 人物シルエット */}
      <circle cx="25.75" cy="14" r="1.3" fill="currentColor" opacity="0.65" />
      <path
        d="M23.5 18 Q25.75 15.5 28 18"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        fill="none"
        opacity="0.65"
      />

      {/* 下段テキスト行（メモを示す横線） */}
      <line
        x1="5.5"
        y1="22.5"
        x2="14.5"
        y2="22.5"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.5"
      />
      <line
        x1="5.5"
        y1="25"
        x2="12"
        y2="25"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.35"
      />
      <line
        x1="21"
        y1="22.5"
        x2="30"
        y2="22.5"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.5"
      />
      <line
        x1="21"
        y1="25"
        x2="27.5"
        y2="25"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.35"
      />

      {/* 桜の花 — アルバム上部中央に重ねて配置 */}
      {/* 花びら x5（72°間隔） */}
      {[0, 72, 144, 216, 288].map((deg, i) => {
        const rad = (deg - 90) * (Math.PI / 180);
        const cx = 18 + Math.cos(rad) * 2.8;
        const cy = 5 + Math.sin(rad) * 2.8;
        return (
          <ellipse
            key={i}
            cx={cx}
            cy={cy}
            rx="2.2"
            ry="1.35"
            transform={`rotate(${deg}, ${cx}, ${cy})`}
            fill="currentColor"
            fillOpacity="0.9"
          />
        );
      })}
      {/* 花芯 */}
      <circle cx="18" cy="5" r="1.3" fill="currentColor" />

      {/* ノッチ（背表紙の留め具） */}
      <rect
        x="16.2"
        y="3.2"
        width="3.6"
        height="2.4"
        rx="1.1"
        fill="currentColor"
      />
    </svg>
  );
}
