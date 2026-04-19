import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { palette } from './theme';
import { Chrome, CornerBrackets, LivePill, Scanlines, SubtleGrid, Vignette } from './Chrome';
import { Beat1Brand } from './scenes/Beat1Brand';
import { Beat2Exclusivity } from './scenes/Beat2Exclusivity';
import { Beat5Date } from './scenes/Beat5Date';

/**
 * Teaser — Version A (cleaner, 3 beats, 5.5s, 165 frames).
 *   1. Brand intro         0 → 48
 *   2. 15 operators only  40 → 92
 *   3. 20.04.2026 lockup  84 → 165
 */
export const MaoRevealTeaser: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: palette.bg }}>
      <SubtleGrid />
      <Vignette />

      <Sequence from={0} durationInFrames={78} name="Beat 1 — Brand">
        <Beat1Brand />
      </Sequence>
      <Sequence from={70} durationInFrames={82} name="Beat 2 — Exclusivity">
        <Beat2Exclusivity />
      </Sequence>
      <Sequence from={144} durationInFrames={126} name="Beat 3 — Date">
        <Beat5Date />
      </Sequence>

      <Sequence from={32}>
        <Chrome reveal={0} />
      </Sequence>
      <Sequence from={38}>
        <CornerBrackets delay={0} />
      </Sequence>
      <Sequence from={44}>
        <LivePill label="cohort 001 · opening" delay={0} />
      </Sequence>

      <Scanlines opacity={0.05} />
    </AbsoluteFill>
  );
};
