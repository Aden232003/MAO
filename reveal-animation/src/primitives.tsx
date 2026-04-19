import React from 'react';
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { fonts, palette } from './theme';

const MAO_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

type ScanTextProps = {
  children: React.ReactNode;
  delay?: number;
  durationInFrames?: number;
  direction?: 'ltr' | 'rtl';
  style?: React.CSSProperties;
};

/**
 * Clip-path wipe reveal. Signature MAO motion: elegant, typography-led.
 * Never per-character opacity — always a single clean sweep.
 */
export const ScanText: React.FC<ScanTextProps> = ({
  children,
  delay = 0,
  durationInFrames = 22,
  direction = 'ltr',
  style,
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [delay, delay + durationInFrames], [0, 1], {
    easing: Easing.bezier(...MAO_EASE),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const clip =
    direction === 'ltr'
      ? `inset(0 ${(1 - progress) * 100}% 0 0)`
      : `inset(0 0 0 ${(1 - progress) * 100}%)`;

  return (
    <span
      style={{
        display: 'inline-block',
        clipPath: clip,
        WebkitClipPath: clip,
        ...style,
      }}
    >
      {children}
    </span>
  );
};

type TrackingResolveProps = {
  children: React.ReactNode;
  delay?: number;
  durationInFrames?: number;
  from?: number;
  to?: number;
  style?: React.CSSProperties;
};

/**
 * Letter-spacing eases wide → tight — a signature "sharpens into place" feel
 * used for headlines. Combined with a gentle opacity ramp.
 */
export const TrackingResolve: React.FC<TrackingResolveProps> = ({
  children,
  delay = 0,
  durationInFrames = 28,
  from = 0.18,
  to = -0.03,
  style,
}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [delay, delay + durationInFrames], [0, 1], {
    easing: Easing.bezier(...MAO_EASE),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const letterSpacing = interpolate(t, [0, 1], [from, to]);
  const opacity = interpolate(t, [0, 0.6], [0, 1], { extrapolateRight: 'clamp' });
  const blur = interpolate(t, [0, 0.7], [4, 0], { extrapolateRight: 'clamp' });

  return (
    <span
      style={{
        display: 'inline-block',
        letterSpacing: `${letterSpacing}em`,
        opacity,
        filter: `blur(${blur}px)`,
        ...style,
      }}
    >
      {children}
    </span>
  );
};

type FadeUpProps = {
  children: React.ReactNode;
  delay?: number;
  distance?: number;
  durationInFrames?: number;
  style?: React.CSSProperties;
};

/**
 * The signature MAO fade-up used in hero + section entries.
 * 30px translateY → 0, opacity 0 → 1, cubic-bezier(0.16, 1, 0.3, 1).
 */
export const FadeUp: React.FC<FadeUpProps> = ({
  children,
  delay = 0,
  distance = 30,
  durationInFrames = 24,
  style,
}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [delay, delay + durationInFrames], [0, 1], {
    easing: Easing.bezier(...MAO_EASE),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        opacity: t,
        transform: `translateY(${(1 - t) * distance}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

type BeatExitProps = {
  children: React.ReactNode;
  exitAt: number;
  durationInFrames?: number;
  liftDistance?: number;
};

/**
 * Wraps a scene so it fades + lifts gracefully when the next beat takes over.
 */
export const BeatExit: React.FC<BeatExitProps> = ({
  children,
  exitAt,
  durationInFrames = 14,
  liftDistance = 40,
}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [exitAt, exitAt + durationInFrames], [0, 1], {
    easing: Easing.bezier(...MAO_EASE),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill
      style={{
        opacity: 1 - t,
        transform: `translateY(${-t * liftDistance}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

type BlinkCursorProps = {
  color?: string;
  width?: number;
  height?: number;
  marginLeft?: number;
};

/**
 * The `_` cursor that blinks in the MAO brand lockup.
 * Matches the website's `.blink` animation (1s step-end infinite).
 */
export const BlinkCursor: React.FC<BlinkCursorProps> = ({
  color = palette.accent,
  width = 0.55,
  height = 0.12,
  marginLeft = 0.08,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const phase = Math.floor((frame / fps) * 2) % 2;
  return (
    <span
      style={{
        display: 'inline-block',
        width: `${width}em`,
        height: `${height}em`,
        background: color,
        marginLeft: `${marginLeft}em`,
        verticalAlign: '-0.02em',
        opacity: phase === 0 ? 1 : 0,
      }}
    />
  );
};

type BrandMarkProps = {
  size?: number;
  showCursor?: boolean;
  color?: string;
  letterSpacing?: number;
  style?: React.CSSProperties;
};

/**
 * `MAO_` wordmark exactly as used in the website nav/footer.
 * Syne 800, tracked 0.1em, lime blinking cursor.
 */
export const BrandMark: React.FC<BrandMarkProps> = ({
  size = 28,
  showCursor = true,
  color = palette.text,
  letterSpacing = 0.1,
  style,
}) => {
  return (
    <span
      style={{
        fontFamily: fonts.display,
        fontWeight: 800,
        fontSize: size,
        color,
        letterSpacing: `${letterSpacing}em`,
        display: 'inline-flex',
        alignItems: 'baseline',
        ...style,
      }}
    >
      MAO
      {showCursor && <BlinkCursor />}
    </span>
  );
};

type GlyphGlitchProps = {
  values: string[];
  delaysInFrames: number[];
  style?: React.CSSProperties;
};

/**
 * Steps through a sequence of string values at given frame boundaries.
 * Each tick gets a subtle scale bounce + accent flash — like a seat counter
 * ticking down. Used in Beat 4 for "15 → 14 → 13".
 */
export const GlyphGlitch: React.FC<GlyphGlitchProps> = ({ values, delaysInFrames, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  let activeIndex = 0;
  for (let i = 0; i < delaysInFrames.length; i += 1) {
    if (frame >= delaysInFrames[i]) activeIndex = i;
  }

  const lastTick = delaysInFrames[activeIndex];
  const sinceTick = frame - lastTick;

  const bounce = spring({
    frame: sinceTick,
    fps,
    config: { damping: 14, stiffness: 260, mass: 0.6 },
    durationInFrames: 18,
  });

  const scale = 1 + bounce * 0.08;
  const flashT = interpolate(sinceTick, [0, 6, 14], [1, 0.35, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <span style={{ position: 'relative', display: 'inline-block', ...style }}>
      <span
        style={{
          display: 'inline-block',
          transform: `scale(${scale})`,
          transformOrigin: 'center',
        }}
      >
        {values[activeIndex]}
      </span>
      <span
        style={{
          position: 'absolute',
          inset: 0,
          color: palette.accent,
          opacity: flashT * 0.85,
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      >
        {values[activeIndex]}
      </span>
    </span>
  );
};
