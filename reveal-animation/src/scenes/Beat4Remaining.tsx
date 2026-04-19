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
import { BeatExit, GlyphGlitch, ScanText } from '../primitives';

const MAO_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const EXIT_AT = 72;

// Counter ticks: starts "15", drops to "14" at frame 10, then "13" at frame 20
const TICK_FRAMES = [0, 10, 20];
const TICK_VALUES = ['15', '14', '13'];

/**
 * The psychological anchor. The counter audibly "drops" twice:
 * 15 → 14 → 13. Each tick gets a scale bounce + accent flash.
 */
export const Beat4Remaining: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // After the last tick, the whole block gets a subtle breathing glow
  const settleT = interpolate(frame, [24, 38], [0, 1], {
    easing: Easing.bezier(...MAO_EASE),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const breath = (Math.sin((frame / fps) * Math.PI * 1.4) + 1) / 2;
  const glowStrength = settleT * (0.35 + breath * 0.4);

  // Entry: headline scale/blur release
  const entryProgress = spring({
    frame: frame - 1,
    fps,
    config: { damping: 18, stiffness: 140, mass: 1 },
    durationInFrames: 18,
  });
  const headlineScale = interpolate(entryProgress, [0, 1], [0.86, 1]);
  const headlineBlur = interpolate(entryProgress, [0, 1], [10, 0], {
    extrapolateRight: 'clamp',
  });

  return (
    <BeatExit exitAt={EXIT_AT} durationInFrames={12} liftDistance={32}>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 44,
          }}
        >
          {/* label */}
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: 19,
              letterSpacing: '0.34em',
              color: palette.live,
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: palette.live,
                boxShadow: `0 0 14px ${palette.live}`,
                opacity: 0.5 + breath * 0.5,
              }}
            />
            <ScanText delay={2} durationInFrames={18}>
              live seat count
            </ScanText>
          </div>

          {/* the counter */}
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 26,
              fontFamily: fonts.display,
              fontWeight: 800,
              letterSpacing: '-0.045em',
              fontVariantNumeric: 'tabular-nums',
              transform: `scale(${headlineScale})`,
              filter: `blur(${headlineBlur}px)`,
              textShadow: `0 0 ${60 + glowStrength * 40}px rgba(200, 255, 0, ${0.25 + glowStrength * 0.35})`,
            }}
          >
            <span style={{ fontSize: 260, color: palette.accent, lineHeight: 0.92 }}>
              <GlyphGlitch values={TICK_VALUES} delaysInFrames={TICK_FRAMES} />
            </span>
            <span style={{ fontSize: 120, color: palette.textMuted, lineHeight: 0.92 }}>/</span>
            <span style={{ fontSize: 150, color: palette.textDim, lineHeight: 0.92 }}>15</span>
          </div>

          {/* word: REMAINING */}
          <div
            style={{
              fontFamily: fonts.display,
              fontWeight: 700,
              fontSize: 74,
              color: palette.text,
              textTransform: 'uppercase',
              letterSpacing: '0.01em',
              textShadow: `0 0 30px rgba(200, 255, 0, ${glowStrength * 0.25})`,
            }}
          >
            <ScanText delay={16} durationInFrames={22}>
              remaining
            </ScanText>
          </div>

          {/* context line */}
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: 17,
              letterSpacing: '0.28em',
              color: palette.textDim,
              textTransform: 'uppercase',
              textAlign: 'center',
            }}
          >
            <ScanText delay={26} durationInFrames={22}>
              2 pre-booked · 13 slots open
            </ScanText>
          </div>
        </div>
      </AbsoluteFill>
    </BeatExit>
  );
};
