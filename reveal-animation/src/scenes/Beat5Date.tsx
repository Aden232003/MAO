import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { fonts, palette } from '../theme';
import { BrandMark, ScanText, TrackingResolve } from '../primitives';
import { DmCta } from '../components/CTA';
import { ProofCaption } from '../components/SocialProof';

const MAO_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * Screenshot-worthy final frame.
 * Brand mark reprise, "APPLICATIONS OPEN" label, the date as the anchor,
 * and a subtle breathing glow on the accent elements.
 */
export const Beat5Date: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const dateProgress = spring({
    frame: frame - 3,
    fps,
    config: { damping: 200, mass: 1 },
    durationInFrames: 26,
  });
  const dateScale = interpolate(dateProgress, [0, 1], [0.92, 1.0]);
  const dateBlur = interpolate(dateProgress, [0, 1], [8, 0], {
    extrapolateRight: 'clamp',
  });
  const dateOpacity = interpolate(frame, [0, 12], [0, 1], {
    easing: Easing.bezier(...MAO_EASE),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const breath = (Math.sin((frame / fps) * Math.PI * 1.3) + 1) / 2;
  const glow = 0.4 + breath * 0.35;

  // Horizontal rule that expands outward beneath the date
  const ruleT = interpolate(frame, [14, 34], [0, 1], {
    easing: Easing.bezier(...MAO_EASE),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0,
        }}
      >
        {/* top reprise: MAO_ */}
        <div style={{ marginBottom: 46 }}>
          <ScanText delay={0} durationInFrames={18}>
            <BrandMark size={60} letterSpacing={0.12} />
          </ScanText>
        </div>

        {/* tracked label — signals exclusivity, not "open to all" */}
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 22,
            letterSpacing: '0.46em',
            color: palette.accent,
            textTransform: 'uppercase',
            fontWeight: 500,
            marginBottom: 32,
          }}
        >
          <ScanText delay={6} durationInFrames={22}>
            application only
          </ScanText>
        </div>

        {/* The date — the anchor */}
        <div
          style={{
            fontFamily: fonts.display,
            fontWeight: 800,
            fontSize: 104,
            lineHeight: 0.92,
            letterSpacing: '-0.02em',
            color: palette.accent,
            opacity: dateOpacity,
            transform: `scale(${dateScale})`,
            filter: `blur(${dateBlur}px)`,
            fontVariantNumeric: 'tabular-nums',
            textShadow: `0 0 ${50 + glow * 60}px rgba(200, 255, 0, ${0.25 + glow * 0.35})`,
          }}
        >
          20.04.2026
        </div>

        {/* accent rule */}
        <div
          style={{
            width: 560 * ruleT,
            height: 2,
            background: palette.accent,
            boxShadow: `0 0 20px ${palette.accent}`,
            marginTop: 34,
            marginBottom: 36,
          }}
        />

        {/* secondary line */}
        <div
          style={{
            fontFamily: fonts.display,
            fontWeight: 700,
            fontSize: 46,
            color: palette.text,
            textTransform: 'uppercase',
            marginBottom: 44,
          }}
        >
          <TrackingResolve delay={20} durationInFrames={26} from={0.16} to={0.01}>
            15 operators · 1 room
          </TrackingResolve>
        </div>

        {/* proof caption — enlarged: 3 bold stat tiles */}
        <div style={{ marginBottom: 58 }}>
          <ProofCaption delay={28} />
        </div>

        {/* prominent CTA — unmissable on the final frame */}
        <DmCta delay={38} primary='DM “MAO”' tagline="discounted seats · early access" />
      </div>
    </AbsoluteFill>
  );
};
