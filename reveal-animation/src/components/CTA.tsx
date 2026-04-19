import React from 'react';
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { fonts, palette } from '../theme';

const MAO_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

type DmCtaProps = {
  delay?: number;
  primary?: string;
  tagline?: string;
};

/**
 * Primary "DM me" CTA for the final frame. Lime pill, breathing glow pulse,
 * unmissable. Sized to be the LAST thing the eye lands on.
 */
export const DmCta: React.FC<DmCtaProps> = ({
  delay = 0,
  primary = 'DM “MAO”',
  tagline = 'discounted seats · early access',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entry
  const entry = spring({
    frame: frame - delay,
    fps,
    config: { damping: 16, stiffness: 140 },
    durationInFrames: 24,
  });
  const entryScale = interpolate(entry, [0, 1], [0.88, 1]);
  const entryOpacity = interpolate(frame, [delay, delay + 12], [0, 1], {
    easing: Easing.bezier(...MAO_EASE),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Breathing pulse — draws the eye but stays premium
  const t = frame - delay;
  const pulse = (Math.sin((t / fps) * Math.PI * 1.3) + 1) / 2;
  const glowStrength = 0.4 + pulse * 0.4;
  const arrowX = pulse * 5;

  // Tagline reveal
  const tagT = interpolate(frame, [delay + 14, delay + 34], [0, 1], {
    easing: Easing.bezier(...MAO_EASE),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
      }}
    >
      {/* the pill — the action */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 20,
          padding: '32px 54px',
          background: palette.accent,
          color: '#000',
          fontFamily: fonts.display,
          fontWeight: 800,
          fontSize: 52,
          letterSpacing: '-0.02em',
          borderRadius: 0,
          opacity: entryOpacity,
          transform: `scale(${entryScale})`,
          boxShadow: `
            0 0 0 1px rgba(200, 255, 0, ${0.3 + pulse * 0.4}),
            0 0 ${60 + pulse * 70}px rgba(200, 255, 0, ${glowStrength * 0.8}),
            0 22px 70px rgba(0, 0, 0, 0.85)
          `,
        }}
      >
        <span>{primary}</span>
        <span
          style={{
            display: 'inline-block',
            transform: `translateX(${arrowX}px)`,
            fontSize: 52,
          }}
        >
          →
        </span>
      </div>

      {/* tagline underneath — exclusivity & urgency */}
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: 19,
          fontWeight: 500,
          letterSpacing: '0.3em',
          color: palette.accent,
          textTransform: 'uppercase',
          opacity: tagT,
          transform: `translateY(${(1 - tagT) * 10}px)`,
          textAlign: 'center',
        }}
      >
        {tagline}
      </div>
    </div>
  );
};
