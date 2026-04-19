import React from 'react';
import { Audio, Sequence, staticFile } from 'remotion';

/**
 * Audio bed — two layered Lyria tracks:
 *   1. music-bed.mp3:     full 14s cinematic arc (intro → build → hit → decay).
 *   2. sustain-tail.mp3:  ambient pad that takes over under the final CTA
 *                         hold, keeping the room alive without new motion.
 *
 * Generate with: GEMINI_API_KEY=... python3.11 scripts/generate-audio.py
 * If a file is missing the ErrorBoundary keeps the render alive (silent).
 */

class AudioBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {}
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export const AudioBed: React.FC = () => {
  return (
    <>
      {/* Primary music bed — plays frames 0 → ~420 */}
      <AudioBoundary>
        <Audio src={staticFile('audio/music-bed.mp3')} volume={0.7} />
      </AudioBoundary>

      {/* Sustain tail — crossfades in under the final date reveal / CTA hold */}
      <Sequence from={370}>
        <AudioBoundary>
          <Audio src={staticFile('audio/sustain-tail.mp3')} volume={0.5} />
        </AudioBoundary>
      </Sequence>
    </>
  );
};
