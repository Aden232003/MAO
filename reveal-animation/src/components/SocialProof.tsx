import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { fonts, palette, safeArea } from '../theme';

const MAO_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

type ProofCardProps = {
  src: string;
  delay?: number;
  durationInFrames?: number;
  x: number | string;
  y: number | string;
  width: number;
  rotate?: number;
  caption: string;
  tint?: 'light' | 'dark';
};

/**
 * A polaroid-style proof slip. Slides in with a spring bounce, hangs for a
 * moment, and lifts out as the next beat takes over. Mirrors the hero
 * receipts on the MAO website — white/dark cards, small "VERIFIED" caption,
 * acid-lime glow to match the brand.
 */
export const ProofCard: React.FC<ProofCardProps> = ({
  src,
  delay = 0,
  durationInFrames = 80,
  x,
  y,
  width,
  rotate = 3,
  caption,
  tint = 'light',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entry = spring({
    frame: frame - delay,
    fps,
    config: { damping: 18, stiffness: 150 },
    durationInFrames: 22,
  });

  const exitStart = delay + durationInFrames - 18;
  const exitT = interpolate(frame, [exitStart, exitStart + 18], [0, 1], {
    easing: Easing.bezier(...MAO_EASE),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const visible = entry * (1 - exitT);
  const liftY = (1 - entry) * 28 + exitT * -22;

  const isDark = tint === 'dark';

  return (
    <div
      style={{
        position: 'absolute',
        top: y,
        left: x,
        width,
        padding: '14px 16px 12px',
        background: isDark ? '#0e0e0e' : '#ffffff',
        border: isDark ? `1px solid ${palette.border}` : 'none',
        borderRadius: 10,
        transform: `translateY(${liftY}px) rotate(${rotate}deg) scale(${0.92 + visible * 0.08})`,
        opacity: visible,
        boxShadow: `
          0 0 0 1px rgba(255, 255, 255, 0.04),
          0 28px 70px rgba(0, 0, 0, 0.7),
          0 0 90px rgba(200, 255, 0, 0.14)
        `,
        fontFamily: fonts.mono,
        pointerEvents: 'none',
      }}
    >
      <Img
        src={src}
        style={{
          display: 'block',
          width: '100%',
          height: 'auto',
          borderRadius: 4,
        }}
      />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          marginTop: 10,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.18em',
          color: isDark ? palette.accent : '#1a8a3a',
          textTransform: 'uppercase',
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: isDark ? palette.accent : '#1a8a3a',
            boxShadow: isDark
              ? `0 0 8px ${palette.accent}`
              : '0 0 7px rgba(26, 138, 58, 0.7)',
          }}
        />
        {caption}
      </div>
    </div>
  );
};

/**
 * Background ghost layer — very faint massive proof numbers drifting slowly.
 * Pure atmosphere, never reads explicitly. Sits at ~4% opacity.
 */
export const GhostProof: React.FC = () => {
  const frame = useCurrentFrame();
  const { height, durationInFrames } = useVideoConfig();

  const entries = [
    { text: '₹38.6L', x: -80, yBase: 0.17, size: 240, speed: 0.28, delay: 20 },
    { text: '$5,500', x: 200, yBase: 0.62, size: 200, speed: 0.38, delay: 90 },
    { text: '3 YRS', x: 260, yBase: 0.34, size: 170, speed: 0.46, delay: 190 },
    { text: '406K', x: -30, yBase: 0.82, size: 210, speed: 0.34, delay: 250 },
  ];

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {entries.map((e, i) => {
        const t = interpolate(frame, [e.delay, e.delay + 30], [0, 1], {
          easing: Easing.bezier(...MAO_EASE),
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const drift = (frame - e.delay) * e.speed;
        const tailFade = 1 - Math.max(0, (frame - durationInFrames + 20) / 20);
        const opacity = t * 0.04 * Math.max(0, tailFade);

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: height * e.yBase - e.size / 2,
              left: e.x - drift,
              fontFamily: fonts.display,
              fontWeight: 800,
              fontSize: e.size,
              letterSpacing: '-0.04em',
              color: palette.accent,
              opacity,
              whiteSpace: 'nowrap',
              mixBlendMode: 'screen',
              filter: 'blur(0.3px)',
            }}
          >
            {e.text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/**
 * Rotating stat ticker that replaces the static "REVEAL · 001" chrome label.
 * Cycles through Aden's headline numbers, one at a time, crossfading.
 */
const PROOF_ROWS: { num: string; label: string }[] = [
  { num: '₹38.6L', label: 'earned solo' },
  { num: '$5,500', label: '1 email · 1 project' },
  { num: '406K', label: 'reel views' },
  { num: '3 yrs', label: 'solo · 1-4 hrs/day' },
];

export const ProofTicker: React.FC<{ reveal?: number }> = ({ reveal = 0 }) => {
  const frame = useCurrentFrame();

  const reveT = interpolate(frame, [reveal, reveal + 22], [0, 1], {
    easing: Easing.bezier(...MAO_EASE),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const CYCLE = 100;
  const effectiveFrame = Math.max(0, frame - reveal - 12);
  const cycleIndex = Math.floor(effectiveFrame / CYCLE) % PROOF_ROWS.length;
  const framesIntoCycle = effectiveFrame % CYCLE;

  const outT = interpolate(framesIntoCycle, [CYCLE - 14, CYCLE], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const inT = interpolate(framesIntoCycle, [0, 14], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const swap = inT * (1 - outT);

  const current = PROOF_ROWS[cycleIndex];

  return (
    <div
      style={{
        position: 'absolute',
        top: safeArea.top - 132,
        right: safeArea.side,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontFamily: fonts.mono,
        fontSize: 13,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        opacity: reveT * swap,
      }}
    >
      <span
        style={{
          display: 'inline-block',
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: palette.accent,
          boxShadow: `0 0 8px ${palette.accent}`,
        }}
      />
      <span style={{ color: palette.accent, fontWeight: 700 }}>{current.num}</span>
      <span style={{ color: palette.textDim }}>· {current.label}</span>
    </div>
  );
};

/**
 * Tight proof caption — the final frame's micro-stat line, appears above CTA.
 */
export const ProofCaption: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [delay, delay + 22], [0, 1], {
    easing: Easing.bezier(...MAO_EASE),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const Tile: React.FC<{ num: string; label: string }> = ({ num, label }) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        minWidth: 220,
      }}
    >
      <span
        style={{
          fontFamily: fonts.display,
          fontWeight: 800,
          fontSize: 62,
          letterSpacing: '-0.03em',
          lineHeight: 1,
          color: palette.accent,
        }}
      >
        {num}
      </span>
      <span
        style={{
          fontFamily: fonts.mono,
          fontSize: 14,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: palette.textDim,
        }}
      >
        {label}
      </span>
    </div>
  );

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 10,
        opacity: t,
        transform: `translateY(${(1 - t) * 10}px)`,
      }}
    >
      <Tile num="₹38.6L" label="earned solo" />
      <span
        style={{
          fontFamily: fonts.display,
          fontSize: 48,
          color: palette.textMuted,
          lineHeight: 1,
          marginTop: 10,
        }}
      >
        ·
      </span>
      <Tile num="3 yrs" label="solo · in business" />
      <span
        style={{
          fontFamily: fonts.display,
          fontSize: 48,
          color: palette.textMuted,
          lineHeight: 1,
          marginTop: 10,
        }}
      >
        ·
      </span>
      <Tile num="1-4 hrs" label="worked / day" />
    </div>
  );
};

/**
 * Convenience: real proof slips using Aden's actual transaction screenshots.
 */
export const SkydoProof: React.FC<{ delay?: number; durationInFrames?: number }> = (p) => (
  <ProofCard
    src={staticFile('proofs/skydo-3500usd.jpg')}
    delay={p.delay ?? 0}
    durationInFrames={p.durationInFrames ?? 80}
    x={1080 - 72 - 420 - 10}
    y={220}
    width={420}
    rotate={3}
    caption="USD 3,500 · SKYDO · PAID"
    tint="light"
  />
);

export const WiseProofAud: React.FC<{ delay?: number; durationInFrames?: number }> = (p) => (
  <ProofCard
    src={staticFile('proofs/wise-8793aud.jpg')}
    delay={p.delay ?? 0}
    durationInFrames={p.durationInFrames ?? 80}
    x={52}
    y={1920 - 260 - 30}
    width={400}
    rotate={-3}
    caption="8,793 AUD · WISE · CLEARED"
    tint="dark"
  />
);

export const WiseProofUsd: React.FC<{ delay?: number; durationInFrames?: number }> = (p) => (
  <ProofCard
    src={staticFile('proofs/wise-multi-usd.jpg')}
    delay={p.delay ?? 0}
    durationInFrames={p.durationInFrames ?? 80}
    x={1080 - 72 - 380 - 10}
    y={1920 - 420 - 30}
    width={380}
    rotate={4}
    caption="$420 + $3,200 · WISE · REPEAT"
    tint="dark"
  />
);
