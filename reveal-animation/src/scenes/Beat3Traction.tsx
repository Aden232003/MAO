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
const TOTAL_SEATS = 15;
const BOOKED = 2;

/**
 * Row of 15 tick marks — 2 filled (accent), 13 empty.
 * Carries visual continuity into Beat 4.
 */
const SeatRow: React.FC<{ delay: number; booked: number }> = ({ delay, booked }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        alignItems: 'center',
      }}
    >
      {Array.from({ length: TOTAL_SEATS }).map((_, i) => {
        const isBooked = i < booked;
        const individualDelay = delay + i * 2.2;

        const entry = interpolate(frame, [individualDelay, individualDelay + 10], [0, 1], {
          easing: Easing.bezier(...MAO_EASE),
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        // Booked seats: delayed accent fill with spring bounce
        const fillDelay = delay + 14 + i * 4;
        const fillProgress = spring({
          frame: frame - fillDelay,
          fps,
          config: { damping: 12, stiffness: 180 },
          durationInFrames: 16,
        });
        const fillT = isBooked ? fillProgress : 0;

        return (
          <div
            key={i}
            style={{
              position: 'relative',
              width: 28,
              height: 46,
              border: `1.5px solid ${isBooked ? palette.accent : palette.border}`,
              background: isBooked ? `rgba(200, 255, 0, ${0.15 + fillT * 0.4})` : 'transparent',
              opacity: entry,
              transform: `translateY(${(1 - entry) * 14}px) scale(${0.9 + entry * 0.1})`,
              transition: 'none',
              boxShadow: isBooked
                ? `0 0 ${16 * fillT}px rgba(200, 255, 0, ${0.5 * fillT})`
                : 'none',
            }}
          >
            {isBooked && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(180deg, transparent 0%, ${palette.accent} 100%)`,
                  transformOrigin: 'bottom',
                  transform: `scaleY(${fillT})`,
                  opacity: 0.9,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export const Beat3Traction: React.FC = () => {
  const frame = useCurrentFrame();

  const headlineBlur = interpolate(frame, [0, 14], [8, 0], {
    extrapolateRight: 'clamp',
  });
  const headlineOpacity = interpolate(frame, [0, 14], [0, 1], {
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
            gap: 50,
          }}
        >
          {/* label */}
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: 19,
              letterSpacing: '0.34em',
              color: palette.textDim,
              textTransform: 'uppercase',
            }}
          >
            <ScanText delay={2} durationInFrames={20}>
              live status · genesis cohort
            </ScanText>
          </div>

          {/* giant number "02 / 15" */}
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 16,
              fontFamily: fonts.display,
              fontWeight: 800,
              letterSpacing: '-0.04em',
              opacity: headlineOpacity,
              filter: `blur(${headlineBlur}px)`,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            <span
              style={{
                fontSize: 210,
                lineHeight: 0.92,
                color: palette.accent,
                textShadow: `0 0 60px rgba(200, 255, 0, 0.4)`,
              }}
            >
              {String(BOOKED).padStart(2, '0')}
            </span>
            <span style={{ fontSize: 120, color: palette.textMuted, lineHeight: 0.92 }}>/</span>
            <span style={{ fontSize: 140, color: palette.textDim, lineHeight: 0.92 }}>
              {TOTAL_SEATS}
            </span>
          </div>

          {/* seat row visual */}
          <SeatRow delay={6} booked={BOOKED} />

          {/* status line */}
          <div
            style={{
              fontFamily: fonts.display,
              fontWeight: 700,
              fontSize: 52,
              color: palette.text,
              textTransform: 'uppercase',
            }}
          >
            <TrackingResolve delay={16} durationInFrames={26} from={0.14} to={0.0}>
              pre-booked
            </TrackingResolve>
          </div>

          {/* sub */}
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: 15,
              letterSpacing: '0.22em',
              color: palette.accent,
              textTransform: 'uppercase',
              marginTop: -22,
            }}
          >
            <ScanText delay={26} durationInFrames={20}>
              · genesis seats already moving ·
            </ScanText>
          </div>
        </div>
      </AbsoluteFill>
    </BeatExit>
  );
};
