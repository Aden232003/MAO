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
import { fonts, palette } from '../theme';
import { BeatExit, ScanText, TrackingResolve } from '../primitives';

const MAO_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const EXIT_AT = 100;

type Receipt = {
  src: string;
  caption: string;
  top: number;
  left: number;
  width: number;
  rotate: number;
  tint: 'light' | 'dark';
  delay: number;
};

const RECEIPTS: Receipt[] = [
  {
    src: 'proofs/skydo-3500usd.jpg',
    caption: 'USD 3,500 · SKYDO · PAID',
    top: 680,
    left: 70,
    width: 500,
    rotate: -4,
    tint: 'light',
    delay: 18,
  },
  {
    src: 'proofs/wise-8793aud.jpg',
    caption: '8,793 AUD · WISE · CLEARED',
    top: 960,
    left: 540,
    width: 460,
    rotate: 5,
    tint: 'dark',
    delay: 30,
  },
  {
    src: 'proofs/wise-multi-usd.jpg',
    caption: '$420 + $3,200 · WISE · REPEAT',
    top: 1260,
    left: 120,
    width: 420,
    rotate: -3,
    tint: 'dark',
    delay: 42,
  },
];

const ProofSlip: React.FC<Receipt> = ({
  src,
  caption,
  top,
  left,
  width,
  rotate,
  tint,
  delay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entry = spring({
    frame: frame - delay,
    fps,
    config: { damping: 18, stiffness: 150 },
    durationInFrames: 22,
  });

  const visible = entry;
  const liftY = (1 - entry) * 32;
  const isDark = tint === 'dark';

  return (
    <div
      style={{
        position: 'absolute',
        top,
        left,
        width,
        padding: '16px 18px 12px',
        background: isDark ? '#0e0e0e' : '#ffffff',
        border: isDark ? `1px solid ${palette.border}` : 'none',
        borderRadius: 12,
        transform: `translateY(${liftY}px) rotate(${rotate}deg) scale(${0.9 + visible * 0.1})`,
        opacity: visible,
        boxShadow: `
          0 0 0 1px rgba(255, 255, 255, 0.05),
          0 34px 80px rgba(0, 0, 0, 0.75),
          0 0 110px rgba(200, 255, 0, 0.18)
        `,
        fontFamily: fonts.mono,
        pointerEvents: 'none',
      }}
    >
      <Img
        src={staticFile(src)}
        style={{
          display: 'block',
          width: '100%',
          height: 'auto',
          borderRadius: 5,
        }}
      />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginTop: 12,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.2em',
          color: isDark ? palette.accent : '#1a8a3a',
          textTransform: 'uppercase',
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
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
 * Dedicated social-proof beat. Frames the payment screenshots as
 * "the model I teach" — proof of Aden's operator income, NOT proof of
 * cohort payments. Three receipts stagger-enter at different angles
 * like polaroids, anchored by a typography-led title and subtitle.
 */
export const Beat3Model: React.FC = () => {
  const frame = useCurrentFrame();

  const titleBlur = interpolate(frame, [0, 16], [8, 0], {
    extrapolateRight: 'clamp',
  });
  const titleOpacity = interpolate(frame, [0, 14], [0, 1], {
    easing: Easing.bezier(...MAO_EASE),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <BeatExit exitAt={EXIT_AT} durationInFrames={12} liftDistance={34}>
      <AbsoluteFill>
        {/* top-aligned title block */}
        <div
          style={{
            position: 'absolute',
            top: 280,
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 22,
          }}
        >
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: 18,
              letterSpacing: '0.4em',
              color: palette.accent,
              textTransform: 'uppercase',
              fontWeight: 500,
            }}
          >
            <ScanText delay={2} durationInFrames={20}>
              the model
            </ScanText>
          </div>

          <div
            style={{
              fontFamily: fonts.display,
              fontWeight: 800,
              fontSize: 110,
              lineHeight: 1.0,
              letterSpacing: '-0.04em',
              color: palette.text,
              textTransform: 'uppercase',
              textAlign: 'center',
              opacity: titleOpacity,
              filter: `blur(${titleBlur}px)`,
            }}
          >
            learn
            <br />
            how&nbsp;i&nbsp;earn
          </div>

          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: 17,
              letterSpacing: '0.24em',
              color: palette.textDim,
              textTransform: 'uppercase',
              textAlign: 'center',
            }}
          >
            <TrackingResolve delay={20} durationInFrames={26} from={0.14} to={0.24}>
              same system you learn · 8 weeks
            </TrackingResolve>
          </div>
        </div>

        {/* the payment proofs — scattered polaroid stack */}
        {RECEIPTS.map((r) => (
          <ProofSlip key={r.src} {...r} />
        ))}
      </AbsoluteFill>
    </BeatExit>
  );
};
