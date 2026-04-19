import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { fonts, palette, safeArea } from './theme';
import { BrandMark } from './primitives';

const MAO_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * Fine 60×60 grid with a radial mask — matches the site's
 * `.hero-grid-overlay`. Sits at the back of every frame.
 */
export const SubtleGrid: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 24], [0, 1], {
    easing: Easing.bezier(...MAO_EASE),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundImage: `
          linear-gradient(rgba(200,255,0,0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(200,255,0,0.035) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        WebkitMaskImage:
          'radial-gradient(ellipse 70% 55% at 50% 50%, black 10%, transparent 75%)',
        maskImage:
          'radial-gradient(ellipse 70% 55% at 50% 50%, black 10%, transparent 75%)',
        opacity: fadeIn * opacity,
      }}
    />
  );
};

/**
 * Subtle radial vignette — adds depth / focus without noise.
 */
export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        'radial-gradient(ellipse 85% 60% at 50% 50%, transparent 40%, rgba(0,0,0,0.65) 100%)',
      pointerEvents: 'none',
    }}
  />
);

/**
 * Tiny right-angle corner brackets — cinematic frame feel.
 * Positioned inside the IG safe area so they never clip behind UI.
 */
export const CornerBrackets: React.FC<{ delay?: number }> = ({ delay = 6 }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [delay, delay + 22], [0, 1], {
    easing: Easing.bezier(...MAO_EASE),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const length = interpolate(t, [0, 1], [0, 36]);
  const opacity = interpolate(t, [0, 1], [0, 0.55]);

  const bracket = (
    transformOrigin: string,
    transform: string,
  ): React.CSSProperties => ({
    position: 'absolute',
    width: length,
    height: length,
    borderTop: `1.5px solid ${palette.accent}`,
    borderLeft: `1.5px solid ${palette.accent}`,
    transformOrigin,
    transform,
    opacity,
  });

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <span style={{ ...bracket('top left', ''), top: safeArea.top, left: safeArea.side }} />
      <span
        style={{
          ...bracket('top right', 'rotate(90deg)'),
          top: safeArea.top,
          right: safeArea.side,
        }}
      />
      <span
        style={{
          ...bracket('bottom left', 'rotate(-90deg)'),
          bottom: safeArea.bottom,
          left: safeArea.side,
        }}
      />
      <span
        style={{
          ...bracket('bottom right', 'rotate(180deg)'),
          bottom: safeArea.bottom,
          right: safeArea.side,
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * Live-cohort pill. Mirrors the hero-event-pill on the website —
 * red pulsing dot + tracked monospace label, glow-behind.
 */
export const LivePill: React.FC<{
  label: string;
  delay?: number;
  top?: number;
}> = ({ label, delay = 10, top = safeArea.top - 96 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const t = interpolate(frame, [delay, delay + 24], [0, 1], {
    easing: Easing.bezier(...MAO_EASE),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const pulseT = (Math.sin((frame / fps) * Math.PI * 1.6) + 1) / 2;
  const dotOpacity = 0.55 + pulseT * 0.45;
  const dotScale = 0.85 + pulseT * 0.15;

  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        opacity: t,
        transform: `translateY(${(1 - t) * 12}px)`,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 14,
          padding: '14px 28px',
          border: `1px solid rgba(200, 255, 0, 0.5)`,
          borderRadius: 999,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(12px)',
          fontFamily: fonts.mono,
          fontSize: 16,
          fontWeight: 500,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: palette.accent,
          boxShadow: `
            0 0 0 1px rgba(200, 255, 0, 0.1),
            0 0 80px rgba(200, 255, 0, 0.2),
            0 18px 48px rgba(0, 0, 0, 0.7)
          `,
        }}
      >
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: palette.live,
            opacity: dotOpacity,
            transform: `scale(${dotScale})`,
            boxShadow: `0 0 16px rgba(255, 45, 45, 0.9), 0 0 4px rgba(255, 45, 45, 1)`,
          }}
        />
        {label}
      </div>
    </div>
  );
};

/**
 * Persistent top-bar brand lockup (MAO_) + bottom-right terminal readout.
 * Keeps the reveal feeling like it belongs to the site's UI system.
 */
export const Chrome: React.FC<{ reveal?: number }> = ({ reveal = 8 }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [reveal, reveal + 20], [0, 1], {
    easing: Easing.bezier(...MAO_EASE),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* top-left brand mark */}
      <div
        style={{
          position: 'absolute',
          top: safeArea.top - 142,
          left: safeArea.side,
          opacity: t,
          transform: `translateY(${(1 - t) * 10}px)`,
        }}
      >
        <BrandMark size={30} />
      </div>

      {/* top-right: replaced by <ProofTicker /> in the composition */}

      {/* bottom-left terminal path */}
      <div
        style={{
          position: 'absolute',
          bottom: safeArea.bottom - 108,
          left: safeArea.side,
          fontFamily: fonts.mono,
          fontSize: 12,
          letterSpacing: '0.18em',
          color: palette.textMuted,
          textTransform: 'uppercase',
          opacity: t * 0.7,
        }}
      >
        /mao/genesis — v1.0
      </div>

      {/* bottom-right date anchor */}
      <div
        style={{
          position: 'absolute',
          bottom: safeArea.bottom - 108,
          right: safeArea.side,
          fontFamily: fonts.mono,
          fontSize: 12,
          letterSpacing: '0.22em',
          color: palette.accent,
          textTransform: 'uppercase',
          opacity: t * 0.8,
        }}
      >
        20.04.2026
      </div>
    </AbsoluteFill>
  );
};

/**
 * Very faint diagonal scanline — low-opacity cinematic texture.
 * Subtle enough to feel like grain, not an effect.
 */
export const Scanlines: React.FC<{ opacity?: number }> = ({ opacity = 0.06 }) => (
  <AbsoluteFill
    style={{
      backgroundImage:
        'repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 3px)',
      opacity,
      mixBlendMode: 'overlay',
      pointerEvents: 'none',
    }}
  />
);
