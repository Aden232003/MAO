import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { palette } from './theme';
import { Chrome, CornerBrackets, LivePill, Scanlines, SubtleGrid, Vignette } from './Chrome';
import { Beat1Brand } from './scenes/Beat1Brand';
import { Beat2Exclusivity } from './scenes/Beat2Exclusivity';
import { Beat3Model } from './scenes/Beat3Model';
import { Beat3Traction } from './scenes/Beat3Traction';
import { Beat4Remaining } from './scenes/Beat4Remaining';
import { Beat5Date } from './scenes/Beat5Date';
import { GhostProof, ProofTicker } from './components/SocialProof';
import { AudioBed } from './audio';

/**
 * Full reveal — Version B (6 beats, 20s, 600 frames @ 30fps).
 *
 * Beat timing (global frames):
 *   1. Brand intro            0 → 78      (2.6s)
 *   2. 15 operators only     70 → 152     (2.73s)
 *   3. THE MODEL (proofs)   144 → 256     (3.73s)  — payment receipts as income proof
 *   4. 02 / 15 pre-booked   248 → 330     (2.73s)
 *   5. 13 / 15 remaining    322 → 406     (2.8s)
 *   6. 20.04.2026 + CTA     398 → 600     (6.73s)  — CTA visible ~5.4s for read time
 */
export const MaoReveal: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: palette.bg, fontFamily: 'inherit' }}>
      {/* atmosphere */}
      <SubtleGrid />
      <GhostProof />
      <Vignette />

      {/* audio — Lyria music bed + sustain tail; silent if files missing */}
      <AudioBed />

      {/* beats */}
      <Sequence from={0} durationInFrames={78} name="Beat 1 — Brand">
        <Beat1Brand />
      </Sequence>
      <Sequence from={70} durationInFrames={82} name="Beat 2 — Exclusivity">
        <Beat2Exclusivity />
      </Sequence>
      <Sequence from={144} durationInFrames={112} name="Beat 3 — The Model">
        <Beat3Model />
      </Sequence>
      <Sequence from={248} durationInFrames={82} name="Beat 4 — Pre-booked">
        <Beat3Traction />
      </Sequence>
      <Sequence from={322} durationInFrames={84} name="Beat 5 — Remaining">
        <Beat4Remaining />
      </Sequence>
      <Sequence from={398} durationInFrames={202} name="Beat 6 — Date + CTA">
        <Beat5Date />
      </Sequence>

      {/* persistent UI — reveals after beat 1 clears */}
      <Sequence from={32}>
        <Chrome reveal={0} />
      </Sequence>
      <Sequence from={38}>
        <CornerBrackets delay={0} />
      </Sequence>
      <Sequence from={44}>
        <LivePill label="cohort 001 · opening" delay={0} />
      </Sequence>
      <Sequence from={50}>
        <ProofTicker reveal={0} />
      </Sequence>

      {/* texture on top */}
      <Scanlines opacity={0.05} />
    </AbsoluteFill>
  );
};
