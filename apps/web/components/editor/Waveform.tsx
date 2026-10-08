'use client';

import { useEffect, useState } from 'react';
import { getWaveformPeaks } from '@/lib/waveform';

export function Waveform({ url }: { url: string }) {
  const [peaks, setPeaks] = useState<number[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getWaveformPeaks(url)
      .then((p) => {
        if (!cancelled) setPeaks(p);
      })
      .catch(() => {
        if (!cancelled) setPeaks([]);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (!peaks) {
    return <div className="shimmer-bg h-full w-full animate-shimmer opacity-30" />;
  }

  return (
    <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
      {peaks.map((p, i) => {
        const barWidth = 100 / peaks.length;
        const height = Math.max(8, p * 90);
        return (
          <rect
            key={i}
            x={i * barWidth + barWidth * 0.15}
            y={(100 - height) / 2}
            width={barWidth * 0.7}
            height={height}
            rx={1}
            fill="rgba(255,255,255,0.75)"
          />
        );
      })}
    </svg>
  );
}
