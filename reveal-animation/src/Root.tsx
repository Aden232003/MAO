import React from 'react';
import { Composition } from 'remotion';
import { MaoReveal } from './MaoReveal';
import { MaoRevealTeaser } from './MaoRevealTeaser';

const FPS = 30;
const WIDTH = 1080;
const HEIGHT = 1920;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MaoReveal"
        component={MaoReveal}
        durationInFrames={600}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="MaoRevealTeaser"
        component={MaoRevealTeaser}
        durationInFrames={270}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    </>
  );
};
