const cache = new Map<string, Promise<number[]>>();

/** Decodes an audio file client-side and downsamples it into peak buckets for
 * a waveform visualization. Cached per URL so re-renders don't re-decode. */
export function getWaveformPeaks(url: string, samples = 80): Promise<number[]> {
  const cacheKey = `${url}::${samples}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const promise = (async () => {
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    const AudioContextCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioContext = new AudioContextCtor();
    try {
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const channelData = audioBuffer.getChannelData(0);
      const blockSize = Math.max(1, Math.floor(channelData.length / samples));
      const peaks: number[] = [];
      for (let i = 0; i < samples; i++) {
        const start = i * blockSize;
        let max = 0;
        for (let j = 0; j < blockSize; j++) {
          const value = Math.abs(channelData[start + j] ?? 0);
          if (value > max) max = value;
        }
        peaks.push(max);
      }
      const peakMax = Math.max(...peaks, 0.01);
      return peaks.map((p) => p / peakMax);
    } finally {
      await audioContext.close();
    }
  })();

  cache.set(cacheKey, promise);
  promise.catch(() => cache.delete(cacheKey));
  return promise;
}
