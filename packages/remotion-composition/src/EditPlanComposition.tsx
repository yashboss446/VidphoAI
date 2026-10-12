import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  OffthreadVideo,
  Img,
  Audio,
  useVideoConfig,
  useCurrentFrame,
  interpolate,
} from 'remotion';
import type {
  EditPlan,
  Clip,
  Transition,
  TransitionDirection,
  FilterPreset,
  TextFontFamily,
} from '@editor/edit-schema';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadSora } from '@remotion/google-fonts/Sora';
import { loadFont as loadPoppins } from '@remotion/google-fonts/Poppins';
import { loadFont as loadBebasNeue } from '@remotion/google-fonts/BebasNeue';
import { loadFont as loadCaveat } from '@remotion/google-fonts/Caveat';
import { loadFont as loadPlayfairDisplay } from '@remotion/google-fonts/PlayfairDisplay';

const loadedFonts: Record<TextFontFamily, string> = {
  inter: loadInter().fontFamily,
  sora: loadSora().fontFamily,
  poppins: loadPoppins().fontFamily,
  bebasNeue: loadBebasNeue().fontFamily,
  caveat: loadCaveat().fontFamily,
  playfairDisplay: loadPlayfairDisplay().fontFamily,
};

const DIRECTION_AXIS: Record<TransitionDirection, { axis: 'X' | 'Y'; sign: 1 | -1 }> = {
  left: { axis: 'X', sign: -1 },
  right: { axis: 'X', sign: 1 },
  up: { axis: 'Y', sign: -1 },
  down: { axis: 'Y', sign: 1 },
};

/** Animates a clip in over its transition duration, relative to the clip's own Sequence. */
function TransitionWrapper({ clip, children }: { clip: Clip; children: React.ReactNode }) {
  const frame = useCurrentFrame();
  const transition = clip.transition as Transition | undefined;
  if (!transition || transition.type === 'none' || transition.durationFrames === 0) {
    return <>{children}</>;
  }

  const progress = interpolate(frame, [0, transition.durationFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const direction = transition.direction ?? 'left';

  if (transition.type === 'fade') {
    return <div style={{ opacity: progress, width: '100%', height: '100%' }}>{children}</div>;
  }

  if (transition.type === 'wipe') {
    const revealed = progress * 100;
    const inset =
      direction === 'left'
        ? `0 ${100 - revealed}% 0 0`
        : direction === 'right'
          ? `0 0 0 ${100 - revealed}%`
          : direction === 'up'
            ? `0 0 ${100 - revealed}% 0`
            : `${100 - revealed}% 0 0 0`;
    return (
      <div style={{ width: '100%', height: '100%', clipPath: `inset(${inset})` }}>{children}</div>
    );
  }

  if (transition.type === 'slide') {
    const { axis, sign } = DIRECTION_AXIS[direction];
    const offset = (1 - progress) * 100 * sign;
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `translate${axis}(${offset}%)`,
        }}
      >
        {children}
      </div>
    );
  }

  if (transition.type === 'zoom') {
    const scale = 0.85 + progress * 0.15;
    return (
      <div style={{ width: '100%', height: '100%', opacity: progress, transform: `scale(${scale})` }}>
        {children}
      </div>
    );
  }

  if (transition.type === 'circle') {
    const radius = progress * 150;
    const origin =
      direction === 'left'
        ? '0% 50%'
        : direction === 'right'
          ? '100% 50%'
          : direction === 'up'
            ? '50% 0%'
            : '50% 100%';
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          clipPath: `circle(${radius}% at ${origin})`,
        }}
      >
        {children}
      </div>
    );
  }

  if (transition.type === 'blur') {
    const blurPx = (1 - progress) * 24;
    return (
      <div style={{ width: '100%', height: '100%', opacity: progress, filter: `blur(${blurPx}px)` }}>
        {children}
      </div>
    );
  }

  if (transition.type === 'flip') {
    const rotation = (1 - progress) * 90;
    return (
      <div style={{ width: '100%', height: '100%', perspective: 1200 }}>
        <div
          style={{
            width: '100%',
            height: '100%',
            opacity: progress > 0.05 ? 1 : 0,
            transform: `rotateY(${rotation}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/** Opacity ramp for a clip's own fade-in/fade-out edges, independent of the entry transition. */
function useFadeOpacity(clip: Clip): number {
  const frame = useCurrentFrame();
  const fadeIn = clip.fadeInFrames ?? 0;
  const fadeOut = clip.fadeOutFrames ?? 0;
  const inOpacity = fadeIn > 0 ? interpolate(frame, [0, fadeIn], [0, 1], { extrapolateRight: 'clamp' }) : 1;
  const outStart = Math.max(0, clip.durationFrames - fadeOut);
  const outOpacity =
    fadeOut > 0
      ? interpolate(frame, [outStart, clip.durationFrames], [1, 0], { extrapolateLeft: 'clamp' })
      : 1;
  return Math.min(inOpacity, outOpacity);
}

function fadeVolume(clip: Clip, baseVolume: number) {
  const fadeIn = clip.fadeInFrames ?? 0;
  const fadeOut = clip.fadeOutFrames ?? 0;
  if (fadeIn === 0 && fadeOut === 0) return baseVolume;
  return (frame: number) => {
    const inGain = fadeIn > 0 ? interpolate(frame, [0, fadeIn], [0, 1], { extrapolateRight: 'clamp' }) : 1;
    const outStart = Math.max(0, clip.durationFrames - fadeOut);
    const outGain =
      fadeOut > 0
        ? interpolate(frame, [outStart, clip.durationFrames], [1, 0], { extrapolateLeft: 'clamp' })
        : 1;
    return baseVolume * Math.min(inGain, outGain);
  };
}

export interface EditPlanCompositionProps {
  editPlan: EditPlan;
  /** Maps a MediaAsset id to a playable URL (signed S3 URL or public URL). */
  assetUrls: Record<string, string>;
}

const FILTER_CSS: Record<FilterPreset, string> = {
  none: 'none',
  warm: 'sepia(0.25) saturate(1.3) brightness(1.05) contrast(1.05)',
  cool: 'saturate(1.1) hue-rotate(-10deg) brightness(1.02) contrast(1.05)',
  vintage: 'sepia(0.4) contrast(0.9) saturate(0.8) brightness(0.95)',
  bw: 'grayscale(1) contrast(1.1)',
  vivid: 'saturate(1.6) contrast(1.15)',
  fade: 'saturate(0.7) contrast(0.85) brightness(1.1)',
  matte: 'contrast(0.9) saturate(0.85) brightness(1.05)',
};

function clipTransformStyle(clip: Clip): React.CSSProperties {
  const { x, y, scale, rotation } = clip.transform;
  const flipH = 'flipHorizontal' in clip && clip.flipHorizontal ? -1 : 1;
  const flipV = 'flipVertical' in clip && clip.flipVertical ? -1 : 1;
  return {
    position: 'absolute',
    inset: 0,
    transform: `translate(${x}px, ${y}px) scale(${scale * flipH}, ${scale * flipV}) rotate(${rotation}deg)`,
  };
}

function visualFilter(clip: Clip): string | undefined {
  if (clip.kind !== 'video' && clip.kind !== 'image') return undefined;
  const preset = FILTER_CSS[clip.filter];
  const presetPart = preset === 'none' ? '' : preset;
  return `${presetPart} brightness(${clip.brightness}%) contrast(${clip.contrast}%)`.trim();
}

function TextAnimationInner({ clip }: { clip: Extract<Clip, { kind: 'text' }> }) {
  const frame = useCurrentFrame();
  const animDuration = Math.min(clip.durationFrames, 20);
  const style = clip.style;

  const textStyle: React.CSSProperties = {
    fontSize: style.fontSize,
    color: style.color,
    fontFamily: loadedFonts[style.fontFamily],
    fontWeight: style.fontWeight === 'bold' ? 700 : 400,
    fontStyle: style.italic ? 'italic' : 'normal',
    letterSpacing: style.letterSpacing,
    textAlign: style.align,
    textShadow: '0 2px 12px rgba(0,0,0,0.6)',
    WebkitTextStroke: style.stroke ? `${style.stroke.width}px ${style.stroke.color}` : undefined,
    display: 'inline-block',
    padding: style.background ? '0.3em 0.6em' : undefined,
    borderRadius: style.background ? 12 : undefined,
    backgroundColor: style.background
      ? hexWithOpacity(style.background.color, style.background.opacity)
      : undefined,
  };

  if (style.animation === 'typewriter') {
    const chars = Math.round(
      interpolate(frame, [0, Math.max(1, animDuration)], [0, clip.text.length], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      }),
    );
    return <div style={textStyle}>{clip.text.slice(0, chars)}</div>;
  }

  if (style.animation === 'wordFade') {
    const words = clip.text.split(' ');
    return (
      <div style={textStyle}>
        {words.map((word, i) => {
          const start = (i / words.length) * animDuration;
          const end = start + animDuration / words.length;
          const opacity = interpolate(frame, [start, end], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <span key={i} style={{ opacity }}>
              {word}
              {i < words.length - 1 ? ' ' : ''}
            </span>
          );
        })}
      </div>
    );
  }

  if (style.animation === 'popIn') {
    const scale = interpolate(frame, [0, animDuration], [0.4, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const opacity = interpolate(frame, [0, animDuration], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return <div style={{ ...textStyle, transform: `scale(${scale})`, opacity }}>{clip.text}</div>;
  }

  if (style.animation === 'bounceIn') {
    const t = Math.min(1, frame / Math.max(1, animDuration));
    const bounce = t < 1 ? 1 + Math.sin(t * Math.PI * 3) * (1 - t) * 0.3 : 1;
    const opacity = interpolate(frame, [0, animDuration / 2], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return <div style={{ ...textStyle, transform: `scale(${bounce})`, opacity }}>{clip.text}</div>;
  }

  if (style.animation === 'slideIn') {
    const offset = interpolate(frame, [0, animDuration], [60, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const opacity = interpolate(frame, [0, animDuration], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return <div style={{ ...textStyle, transform: `translateY(${offset}px)`, opacity }}>{clip.text}</div>;
  }

  return <div style={textStyle}>{clip.text}</div>;
}

function hexWithOpacity(hex: string, opacity: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) || 0;
  const g = parseInt(clean.substring(2, 4), 16) || 0;
  const b = parseInt(clean.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function ClipRenderer({ clip, assetUrls }: { clip: Clip; assetUrls: Record<string, string> }) {
  const fadeOpacity = useFadeOpacity(clip);

  switch (clip.kind) {
    case 'video': {
      const src = assetUrls[clip.assetId];
      if (!src) return null;
      return (
        <div style={{ ...clipTransformStyle(clip), opacity: fadeOpacity, filter: visualFilter(clip) }}>
          <OffthreadVideo
            src={src}
            startFrom={clip.sourceInFrame}
            volume={fadeVolume(clip, clip.volume)}
            playbackRate={clip.speed}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      );
    }
    case 'image': {
      const src = assetUrls[clip.assetId];
      if (!src) return null;
      return (
        <div style={{ ...clipTransformStyle(clip), opacity: fadeOpacity, filter: visualFilter(clip) }}>
          <Img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      );
    }
    case 'audio': {
      const src = assetUrls[clip.assetId];
      if (!src) return null;
      return (
        <Audio
          src={src}
          startFrom={clip.sourceInFrame}
          volume={fadeVolume(clip, clip.volume)}
          playbackRate={clip.speed}
        />
      );
    }
    case 'text': {
      const justify =
        clip.style.position === 'top' ? 'flex-start' : clip.style.position === 'bottom' ? 'flex-end' : 'center';
      const alignItems =
        clip.style.align === 'left' ? 'flex-start' : clip.style.align === 'right' ? 'flex-end' : 'center';
      return (
        <AbsoluteFill
          style={{
            justifyContent: justify,
            alignItems,
            padding: 48,
            opacity: fadeOpacity,
          }}
        >
          <div
            style={{
              transform: `translate(${clip.transform.x}px, ${clip.transform.y}px) scale(${clip.transform.scale}) rotate(${clip.transform.rotation}deg)`,
            }}
          >
            <TextAnimationInner clip={clip} />
          </div>
        </AbsoluteFill>
      );
    }
    default:
      return null;
  }
}

export const EditPlanComposition: React.FC<EditPlanCompositionProps> = ({
  editPlan,
  assetUrls,
}) => {
  const { fps } = useVideoConfig();
  void fps;
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {editPlan.tracks.map((track) =>
        track.clips.map((clip) => (
          <Sequence
            key={clip.id}
            from={clip.startFrame}
            durationInFrames={clip.durationFrames}
            layout={track.type === 'audio' ? 'none' : undefined}
          >
            <TransitionWrapper clip={clip}>
              <ClipRenderer clip={clip} assetUrls={assetUrls} />
            </TransitionWrapper>
          </Sequence>
        )),
      )}
    </AbsoluteFill>
  );
};
