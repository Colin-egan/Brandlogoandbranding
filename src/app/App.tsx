// Torque — Brand Identity System
import React from "react";

const B = {
  bg: "#05080F",
  surface: "#0C1219",
  surfaceHigh: "#111A26",
  blue: "#2563EB",
  blueLight: "#3B82F6",
  bluePale: "#93C5FD",
  cyan: "#22D3EE",
  white: "#F0F4F8",
  muted: "#4A6080",
  border: "#18253A",
};

// Arc math — all angles in SVG convention (0°=right, 90°=down, clockwise)
function pt(cx: number, cy: number, r: number, deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [
    parseFloat((cx + r * Math.cos(rad)).toFixed(3)),
    parseFloat((cy + r * Math.sin(rad)).toFixed(3)),
  ];
}

// Donut-segment arc path: clockwise from startDeg to endDeg (270° sweep)
function arcPath(cx: number, cy: number, outerR: number, innerR: number, startDeg: number, endDeg: number): string {
  const [osx, osy] = pt(cx, cy, outerR, startDeg);
  const [oex, oey] = pt(cx, cy, outerR, endDeg);
  const [isx, isy] = pt(cx, cy, innerR, startDeg);
  const [iex, iey] = pt(cx, cy, innerR, endDeg);
  // 270° arc → large-arc=1; CW outer (sweep=1), CCW inner (sweep=0)
  return `M${osx},${osy} A${outerR},${outerR},0,1,1,${oex},${oey} L${iex},${iey} A${innerR},${innerR},0,1,0,${isx},${isy}Z`;
}

interface MarkProps {
  size?: number;
  bg?: string;
  accent?: string;
  node?: string;
}

function Mark({ size = 80, bg = B.surface, accent = B.blue, node = "#FFFFFF" }: MarkProps) {
  const cx = 50, cy = 50;
  const outerR = 32, innerR = 20;
  const nodeR = (outerR + innerR) / 2; // 26 — midline of arc band

  // C-shape arc: 45° (lower-right) → clockwise 270° → 315° (upper-right)
  // Gap is on the right (from 315° through 0° to 45° = 90° gap)
  const path = arcPath(cx, cy, outerR, innerR, 45, 315);

  const [snx, sny] = pt(cx, cy, nodeR, 45);   // lower-right node
  const [enx, eny] = pt(cx, cy, nodeR, 315);  // upper-right node

  // Lever arm: center → left (180° direction)
  const leverX = 6;

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={{ display: "block", flexShrink: 0 }}
      aria-label="Torque logomark"
    >
      {/* Background tile */}
      <rect width="100" height="100" rx="20" fill={bg} />

      {/* Lever arm: drawn first so arc overlaps its inner portion */}
      <line
        x1={cx} y1={cy}
        x2={leverX} y2={cy}
        stroke={accent}
        strokeWidth="10"
        strokeLinecap="round"
      />

      {/* Main C-shaped arc donut */}
      <path d={path} fill={accent} />

      {/* Network connection lines inside the donut hole */}
      <line x1={cx} y1={cy} x2={snx} y2={sny} stroke={node} strokeWidth="1.5" strokeOpacity="0.38" />
      <line x1={cx} y1={cy} x2={enx} y2={eny} stroke={node} strokeWidth="1.5" strokeOpacity="0.38" />
      <line x1={snx} y1={sny} x2={enx} y2={eny} stroke={node} strokeWidth="1" strokeOpacity="0.18" />

      {/* Center pivot */}
      <circle cx={cx} cy={cy} r="4.5" fill={accent} />
      <circle cx={cx} cy={cy} r="2.2" fill={bg} />

      {/* Arc endpoint nodes — sit atop the arc band */}
      <circle cx={snx} cy={sny} r="5.5" fill={node} />
      <circle cx={enx} cy={eny} r="5.5" fill={node} />

      {/* Lever tip node */}
      <circle cx={leverX} cy={cy} r="6.5" fill={bg} />
      <circle cx={leverX} cy={cy} r="4" fill={accent} />
      <circle cx={leverX} cy={cy} r="2" fill={node} />
    </svg>
  );
}

// ────────────────────────────────────────────────────────────
// Full-page brand identity
// ────────────────────────────────────────────────────────────

const PALETTE = [
  { name: "Deep Navy",    hex: "#05080F" },
  { name: "Surface",      hex: "#0C1219" },
  { name: "Electric Blue",hex: "#2563EB" },
  { name: "Vivid Blue",   hex: "#3B82F6" },
  { name: "Sky Blue",     hex: "#93C5FD" },
  { name: "Arctic White", hex: "#F0F4F8" },
];

// ────────────────────────────────────────────────────────────
// Download Card Component
// ────────────────────────────────────────────────────────────

interface DownloadCardProps {
  title: string;
  description: string;
  preview: React.ReactNode;
  bgColor?: string;
  files: Array<{
    label: string;
    path: string;
    isPng?: boolean;
    size?: number;
  }>;
}

function DownloadCard({ title, description, preview, bgColor = B.surface, files }: DownloadCardProps) {
  const downloadSVG = (path: string, filename: string) => {
    const link = document.createElement("a");
    link.href = path;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPNG = async (svgPath: string, filename: string, size: number) => {
    try {
      const response = await fetch(svgPath);
      const svgText = await response.text();
      const blob = new Blob([svgText], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, size, size);
          canvas.toBlob((pngBlob) => {
            if (pngBlob) {
              const pngUrl = URL.createObjectURL(pngBlob);
              const link = document.createElement("a");
              link.href = pngUrl;
              link.download = filename;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(pngUrl);
            }
          });
        }
        URL.revokeObjectURL(url);
      };
      img.src = url;
    } catch (error) {
      console.error("PNG export failed:", error);
    }
  };

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: `1px solid ${B.border}` }}
    >
      <div
        className="p-8 flex items-center justify-center"
        style={{ background: bgColor, minHeight: 140 }}
      >
        {preview}
      </div>
      <div className="p-4" style={{ background: B.surface }}>
        <p className="font-semibold text-sm mb-1">{title}</p>
        <p className="text-xs mb-4" style={{ color: B.muted }}>
          {description}
        </p>
        <div className="flex flex-wrap gap-2">
          {files.map((file) => {
            const filename = file.path.split("/").pop()?.replace(".svg", file.isPng ? `.${file.size}px.png` : ".svg") || "logo";
            return (
              <button
                key={file.label}
                onClick={() =>
                  file.isPng && file.size
                    ? downloadPNG(file.path, filename, file.size)
                    : downloadSVG(file.path, filename)
                }
                className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all hover:scale-105"
                style={{
                  background: B.surfaceHigh,
                  color: B.bluePale,
                  border: `1px solid ${B.border}`,
                }}
              >
                {file.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div
      className="min-h-screen"
      style={{
        background: B.bg,
        color: B.white,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* ── HERO ─────────────────────────────────────────── */}
      <section
        className="px-16 pt-24 pb-20"
        style={{ borderBottom: `1px solid ${B.border}` }}
      >
        {/* Primary lockup */}
        <div className="flex items-center gap-8 mb-16">
          <Mark size={120} />
          <div>
            <div
              className="text-[4.5rem] leading-none tracking-[0.18em] uppercase font-black"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              TORQUE
            </div>
            <div
              className="text-sm tracking-[0.55em] uppercase mt-3"
              style={{ color: B.muted }}
            >
              leverage your network
            </div>
          </div>
        </div>

        {/* Descriptor */}
        <p
          className="text-[2rem] font-light leading-snug max-w-lg"
          style={{ color: B.muted }}
        >
          Analyze, map, and activate
          <br />
          <span style={{ color: B.white }} className="font-semibold">
            your LinkedIn connections.
          </span>
        </p>
      </section>

      {/* ── LOGO SYSTEM ──────────────────────────────────── */}
      <section
        className="px-16 py-20"
        style={{ borderBottom: `1px solid ${B.border}` }}
      >
        <p className="text-xs tracking-[0.35em] uppercase mb-10" style={{ color: B.muted }}>
          Logo System
        </p>

        <div className="flex items-end gap-16">
          {/* Dark */}
          <div>
            <Mark size={104} />
            <p className="text-xs mt-4" style={{ color: B.muted }}>Primary · Dark</p>
          </div>

          {/* Light */}
          <div>
            <Mark size={104} bg="#EEF2F7" accent={B.blue} node={B.surface} />
            <p className="text-xs mt-4" style={{ color: B.muted }}>Primary · Light</p>
          </div>

          {/* Blue */}
          <div>
            <Mark size={104} bg={B.blue} accent="#FFFFFF" node={B.blue} />
            <p className="text-xs mt-4" style={{ color: B.muted }}>Reversed · Blue</p>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 120, background: B.border }} />

          {/* Small sizes */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-5">
              <Mark size={48} />
              <p className="text-xs" style={{ color: B.muted }}>48px app icon</p>
            </div>
            <div className="flex items-center gap-5">
              <Mark size={32} />
              <p className="text-xs" style={{ color: B.muted }}>32px toolbar</p>
            </div>
            <div className="flex items-center gap-5">
              <Mark size={16} />
              <p className="text-xs" style={{ color: B.muted }}>16px favicon</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── COLOR PALETTE ────────────────────────────────── */}
      <section
        className="px-16 py-20"
        style={{ borderBottom: `1px solid ${B.border}` }}
      >
        <p className="text-xs tracking-[0.35em] uppercase mb-10" style={{ color: B.muted }}>
          Color System
        </p>

        <div className="flex gap-4">
          {PALETTE.map((c) => (
            <div key={c.hex} className="flex-1">
              <div
                className="h-20 rounded-2xl mb-4 cursor-pointer transition-transform hover:scale-105"
                style={{
                  background: c.hex,
                  border: c.hex === "#05080F" ? `1px solid ${B.border}` : "none",
                }}
                onClick={() => {
                  navigator.clipboard.writeText(c.hex);
                }}
                title="Click to copy hex code"
              />
              <p className="text-xs font-semibold" style={{ color: B.white }}>
                {c.name}
              </p>
              <p
                className="text-xs font-mono mt-1 cursor-pointer hover:text-white transition-colors"
                style={{ color: B.muted }}
                onClick={() => {
                  navigator.clipboard.writeText(c.hex);
                }}
                title="Click to copy"
              >
                {c.hex}
              </p>
            </div>
          ))}
        </div>

        {/* Blue gradient strip */}
        <div
          className="h-2 rounded-full mt-10"
          style={{
            background: `linear-gradient(90deg, #0D1420, #1A3060, ${B.blue}, ${B.blueLight}, ${B.bluePale}, ${B.cyan})`,
          }}
        />
      </section>

      {/* ── TYPOGRAPHY ───────────────────────────────────── */}
      <section
        className="px-16 py-20"
        style={{ borderBottom: `1px solid ${B.border}` }}
      >
        <p className="text-xs tracking-[0.35em] uppercase mb-10" style={{ color: B.muted }}>
          Typography
        </p>

        <div className="space-y-10">
          <div>
            <p
              className="text-[3.25rem] font-black tracking-[0.14em] uppercase leading-none"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Space Grotesk Black
            </p>
            <p className="text-xs mt-3" style={{ color: B.muted }}>
              Display · Wordmark · Hero CTAs — Black 900, +14% tracking, uppercase
            </p>
          </div>

          <div style={{ borderTop: `1px solid ${B.border}`, paddingTop: 32 }}>
            <p className="text-3xl font-semibold tracking-tight">
              Inter Semibold — Headings and Section Titles
            </p>
            <p className="text-xs mt-3" style={{ color: B.muted }}>
              Headings — 600 weight, tight tracking
            </p>
          </div>

          <div style={{ borderTop: `1px solid ${B.border}`, paddingTop: 32 }}>
            <p className="text-base font-normal leading-relaxed max-w-2xl" style={{ color: B.muted }}>
              Inter Regular — Used for body copy, UI descriptions, and supporting text.
              Designed for comfortable reading at length. Pair with generous line height.
            </p>
            <p className="text-xs mt-3" style={{ color: B.muted }}>
              Body — 400 weight, relaxed line height
            </p>
          </div>

          <div style={{ borderTop: `1px solid ${B.border}`, paddingTop: 32 }}>
            <p
              className="text-xs tracking-[0.35em] uppercase font-mono"
              style={{ color: B.bluePale }}
            >
              System Mono · Overlines · Tags · Code Labels
            </p>
            <p className="text-xs mt-3" style={{ color: B.muted }}>
              Metadata · Technical labels — Monospace, uppercase, wide tracking
            </p>
          </div>
        </div>
      </section>

      {/* ── IN CONTEXT ───────────────────────────────────── */}
      <section
        className="px-16 py-20"
        style={{ borderBottom: `1px solid ${B.border}` }}
      >
        <p className="text-xs tracking-[0.35em] uppercase mb-10" style={{ color: B.muted }}>
          In Context
        </p>

        <div className="flex gap-4 flex-wrap">
          {/* Dark nav bar */}
          <div
            className="flex items-center gap-4 px-6 py-4 rounded-2xl"
            style={{ background: B.surface, border: `1px solid ${B.border}`, flex: 1, minWidth: 260 }}
          >
            <Mark size={40} />
            <div>
              <p
                className="font-black text-sm tracking-[0.15em] uppercase"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                TORQUE
              </p>
              <p className="text-xs mt-0.5" style={{ color: B.muted }}>
                leverage your network
              </p>
            </div>
          </div>

          {/* Light card */}
          <div
            className="flex items-center gap-4 px-6 py-4 rounded-2xl"
            style={{ background: "#EEF2F7", flex: 1, minWidth: 260 }}
          >
            <Mark size={40} bg="#E2E8F0" accent={B.blue} node="#0C1219" />
            <div>
              <p
                className="font-black text-sm tracking-[0.15em] uppercase"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#0C1219" }}
              >
                TORQUE
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#607090" }}>
                leverage your network
              </p>
            </div>
          </div>

          {/* Electric blue badge */}
          <div
            className="flex items-center gap-4 px-6 py-4 rounded-2xl"
            style={{ background: B.blue, flex: "0 0 auto" }}
          >
            <Mark size={40} bg={B.blue} accent="#FFFFFF" node={B.blue} />
            <div>
              <p
                className="font-black text-sm tracking-[0.15em] uppercase text-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                TORQUE
              </p>
              <p className="text-xs mt-0.5 text-white/60">
                leverage your network
              </p>
            </div>
          </div>
        </div>

        {/* Tagline specimen */}
        <div
          className="mt-10 rounded-3xl px-12 py-14 flex items-center justify-between"
          style={{ background: B.surface, border: `1px solid ${B.border}` }}
        >
          <div>
            <p
              className="text-[2.5rem] font-black uppercase tracking-[0.22em] leading-none"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: B.blue }}
            >
              TORQUE
            </p>
            <p
              className="text-xs tracking-[0.6em] uppercase mt-3"
              style={{ color: B.muted }}
            >
              leverage your network
            </p>
          </div>

          <Mark size={88} />
        </div>
      </section>

      {/* ── DOWNLOADS ────────────────────────────────────── */}
      <section className="px-16 py-20">
        <p className="text-xs tracking-[0.35em] uppercase mb-10" style={{ color: B.muted }}>
          Download Assets
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DownloadCard
            title="Primary Dark"
            description="Logo with dark background"
            preview={<Mark size={80} />}
            files={[
              { label: "SVG", path: "/logos/torque-primary-dark.svg" },
              { label: "Icon SVG", path: "/logos/torque-icon-only-dark.svg" },
            ]}
          />

          <DownloadCard
            title="Primary Light"
            description="Logo with light background"
            preview={<Mark size={80} bg="#EEF2F7" accent={B.blue} node="#0C1219" />}
            bgColor="#F8FAFC"
            files={[
              { label: "SVG", path: "/logos/torque-primary-light.svg" },
              { label: "Icon SVG", path: "/logos/torque-icon-only-light.svg" },
            ]}
          />

          <DownloadCard
            title="Reversed Blue"
            description="White on blue background"
            preview={<Mark size={80} bg={B.blue} accent="#FFFFFF" node={B.blue} />}
            bgColor={B.blue}
            files={[
              { label: "SVG", path: "/logos/torque-reversed-blue.svg" },
            ]}
          />

          <DownloadCard
            title="Wordmark Dark"
            description="Horizontal lockup, dark"
            preview={
              <div className="flex items-center gap-3">
                <Mark size={40} />
                <div>
                  <p className="font-black text-xs tracking-[0.15em] uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>TORQUE</p>
                  <p className="text-[7px] tracking-[0.4em] uppercase" style={{ color: B.muted }}>leverage your network</p>
                </div>
              </div>
            }
            files={[
              { label: "SVG", path: "/logos/torque-wordmark-horizontal-dark.svg" },
            ]}
          />

          <DownloadCard
            title="Wordmark Light"
            description="Horizontal lockup, light"
            preview={
              <div className="flex items-center gap-3">
                <Mark size={40} bg="#E2E8F0" accent={B.blue} node="#0C1219" />
                <div>
                  <p className="font-black text-xs tracking-[0.15em] uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#0C1219" }}>TORQUE</p>
                  <p className="text-[7px] tracking-[0.4em] uppercase" style={{ color: "#607090" }}>leverage your network</p>
                </div>
              </div>
            }
            bgColor="#F8FAFC"
            files={[
              { label: "SVG", path: "/logos/torque-wordmark-horizontal-light.svg" },
            ]}
          />

          <DownloadCard
            title="LinkedIn Banner"
            description="1584 × 396px cover image"
            preview={
              <div className="w-full h-full flex items-center justify-center" style={{ background: B.bg }}>
                <div className="text-center">
                  <p className="font-black text-xl tracking-[0.18em] uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>TORQUE</p>
                  <p className="text-[9px] tracking-[0.55em] uppercase mt-1" style={{ color: B.muted }}>leverage your network</p>
                </div>
              </div>
            }
            files={[
              { label: "SVG", path: "/logos/torque-linkedin-banner.svg" },
            ]}
          />

          <DownloadCard
            title="PNG Exports"
            description="Rasterized versions"
            preview={<Mark size={80} />}
            files={[
              { label: "512px PNG", path: "/logos/torque-primary-dark.svg", isPng: true, size: 512 },
              { label: "256px PNG", path: "/logos/torque-primary-dark.svg", isPng: true, size: 256 },
              { label: "128px PNG", path: "/logos/torque-primary-dark.svg", isPng: true, size: 128 },
              { label: "64px PNG", path: "/logos/torque-primary-dark.svg", isPng: true, size: 64 },
              { label: "32px PNG", path: "/logos/torque-primary-dark.svg", isPng: true, size: 32 },
            ]}
          />
        </div>

        {/* Usage guidelines */}
        <div
          className="mt-10 rounded-2xl px-8 py-6"
          style={{ background: B.surface, border: `1px solid ${B.border}` }}
        >
          <p className="text-xs tracking-[0.35em] uppercase mb-4" style={{ color: B.muted }}>
            Usage Guidelines
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm" style={{ color: B.muted }}>
            <div>
              <p className="font-semibold mb-2" style={{ color: B.white }}>Clear Space</p>
              <p>Maintain minimum padding equal to the height of the lever arm around the logo.</p>
            </div>
            <div>
              <p className="font-semibold mb-2" style={{ color: B.white }}>Minimum Size</p>
              <p>Never display the logo smaller than 32px × 32px for digital or 0.5" for print.</p>
            </div>
            <div>
              <p className="font-semibold mb-2" style={{ color: B.white }}>Color Modifications</p>
              <p>Do not alter logo colors. Use only the provided variants.</p>
            </div>
            <div>
              <p className="font-semibold mb-2" style={{ color: B.white }}>Distortion</p>
              <p>Do not stretch, rotate, or skew the logo. Always maintain aspect ratio.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
