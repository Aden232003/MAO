import { loadFont as loadSyne } from '@remotion/google-fonts/Syne';
import { loadFont as loadMono } from '@remotion/google-fonts/JetBrainsMono';

const syne = loadSyne('normal', {
  weights: ['400', '600', '700', '800'],
  subsets: ['latin'],
});

const mono = loadMono('normal', {
  weights: ['300', '400', '500', '700'],
  subsets: ['latin'],
});

export const fonts = {
  display: syne.fontFamily,
  mono: mono.fontFamily,
};

export const palette = {
  bg: '#050505',
  bg2: '#0c0c0c',
  surface: '#111111',
  border: '#1a1a1a',
  borderHover: '#2a2a2a',
  text: '#e8e8e8',
  textDim: '#777777',
  textMuted: '#444444',
  accent: '#c8ff00',
  accentDim: 'rgba(200, 255, 0, 0.08)',
  accentMid: 'rgba(200, 255, 0, 0.25)',
  live: '#ff2d2d',
};

export const safeArea = {
  top: 268,
  bottom: 268,
  side: 72,
};

export const contentMaxWidth = 880;
