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
import { BeatExit, ScanText, TrackingResolve } from '../primitives';

const MAO_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const EXIT_AT = 70;

export const Beat2Exclusivity: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // The "15" enters with a spring scale from 0.72 → 1.0 and drops its blur
  const numberProgress = spring({
    frame: frame - 2,
    fps,
    config: { damping: 16, stiffness: 110, mass: 1.1 },
    durationInFrames: 24,
  });
  const numberScale = interpolate(numberProgress, [0, 1], [0.72, 1.0]);
  const numberBlur = interpolate(numberProgress, [0, 1], [10, 0], {
    extrapolateRight: 'clamp',
  });
  const numberOpacity = interpolate(frame, [0, 10], [0, 1], {
    easing: Easing.bezier(...MAO_EASE),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Tiny horizontal rule under the number expands outward after the number settles
  const ruleT = interpolate(frame, [18, 34], [0, 1], {
    easing: Easing.bezier(...MAO_EASE),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <BeatExit exitAt={EXIT_AT} durationInFrames={12}>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0,
          }}
        >
          {/* top label */}
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: 21,
              letterSpacing: '0.36em',
              color: palette.accent,
              textTransform: 'uppercase',
              marginBottom: 40,
              fontWeight: 500,
            }}
          >
            <ScanText delay={4} durationInFrames={22}>
              [ cohort 001 · genesis ]
            </ScanText>
          </div>

          {/* THE NUMBER — gigantic Syne 800 */}
          <div
            style={{
              fontFamily: fonts.display,
              fontWeight: 800,
              fontSize: 440,
              lineHeight: 0.92,
              letterSpacing: '-0.04em',
              color: palette.text,
              opacity: numberOpacity,
              transform: `scale(${numberScale})`,
              filter: `blur(${numberBlur}px)`,
              textShadow: '0 0 80px rgba(200, 255, 0, 0.12)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            15
          </div>

          {/* accent underline expanding outward */}
          <div
            style={{
              width: 420 * ruleT,
              height: 2,
              background: palette.accent,
              boxShadow: `0 0 16px ${palette.accent}`,
              marginTop: 24,
              marginBottom: 40,
            }}
          />

          {/* headline — Syne 700 with tracking resolve */}
          <div
            style={{
              fontFamily: fonts.display,
              fontWeight: 700,
              fontSize: 72,
              color: palette.text,
              textTransform: 'uppercase',
            }}
          >
            <TrackingResolve delay={14} durationInFrames={26} from={0.14} to={0.02}>
              operators only
            </TrackingResolve>
          </div>

          {/* sub-label */}
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: 16,
              letterSpacing: '0.22em',
              color: palette.textDim,
              textTransform: 'uppercase',
              marginTop: 30,
            }}
          >
            <ScanText delay={22} durationInFrames={24}>
              not for spectators · built for scale
            </ScanText>
          </div>
        </div>
      </AbsoluteFill>
    </BeatExit>
  );
};
