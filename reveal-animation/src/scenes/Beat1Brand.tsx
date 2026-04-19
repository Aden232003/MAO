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
import { ScanText, BeatExit } from '../primitives';

const MAO_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const EXIT_AT = 66;

export const Beat1Brand: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();

  // Logo: blur-release + scale settle — "sharpens into place"
  const logoProgress = spring({
    frame: frame - 4,
    fps,
    config: { damping: 200, mass: 1, stiffness: 100 },
    durationInFrames: 26,
  });
  const logoScale = interpolate(logoProgress, [0, 1], [0.92, 1.0]);
  const logoBlur = interpolate(logoProgress, [0, 1], [6, 0], {
    extrapolateRight: 'clamp',
  });
  const logoOpacity = interpolate(frame, [0, 14], [0, 1], {
    easing: Easing.bezier(...MAO_EASE),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Scanline: an acid-lime horizontal sweep traces down the frame in the first
  // 18 frames — cinematic "projector boot" feeling.
  const scanY = interpolate(frame, [0, 18], [-8, height + 8], {
    easing: Easing.bezier(0.22, 0.61, 0.36, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scanOpacity = interpolate(frame, [0, 4, 16, 18], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <BeatExit exitAt={EXIT_AT} durationInFrames={12} liftDistance={40}>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        {/* scanline sweep */}
        <div
          style={{
            position: 'absolute',
            top: scanY,
            left: 0,
            right: 0,
            height: 1,
            background: `linear-gradient(90deg, transparent 0%, ${palette.accent} 50%, transparent 100%)`,
            opacity: scanOpacity,
            boxShadow: `0 0 24px ${palette.accent}, 0 0 60px rgba(200, 255, 0, 0.4)`,
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 52,
          }}
        >
          {/* small label above logo */}
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: 20,
              letterSpacing: '0.42em',
              color: palette.textDim,
              textTransform: 'uppercase',
            }}
          >
            <ScanText delay={10} durationInFrames={20}>
              — MODERN AI OPERATOR —
            </ScanText>
          </div>

          {/* MAO logo — exactly as established on site */}
          <Img
            src={staticFile('mao-logo.png')}
            style={{
              width: 720,
              height: 720,
              opacity: logoOpacity,
              transform: `scale(${logoScale})`,
              filter: `blur(${logoBlur}px)`,
              borderRadius: 4,
            }}
          />

          {/* sub-tag */}
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: 19,
              letterSpacing: '0.3em',
              color: palette.textDim,
              textTransform: 'uppercase',
              textAlign: 'center',
            }}
          >
            <ScanText delay={22} durationInFrames={22}>
              a selective operator room
            </ScanText>
          </div>
        </div>

        {/* safe-area placeholder so the composition knows our bounds */}
        <div
          style={{
            position: 'absolute',
            top: safeArea.top,
            bottom: safeArea.bottom,
            left: safeArea.side,
            right: safeArea.side,
            pointerEvents: 'none',
          }}
        />
      </AbsoluteFill>
    </BeatExit>
  );
};
