const cache = new Map<string, Promise<number[]>>();

/** Lightweight, fully client-side beat/onset detector — decodes the audio the same way
 * `getWaveformPeaks` does, computes a short-window RMS energy envelope, and peak-picks
 * onsets above a dynamic (mean + k*stddev) threshold with a minimum spacing between
 * beats. This is a simple energy-envelope approach, not ML-based beat tracking — good
 * enough to snap trims/drags to the beat without needing a server-side analysis service. */
export function detectBeats(url: string): Promise<number[]> {
  const cached = cache.get(url);
  if (cached) return cached;

  const promise = (async () => {
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    const AudioContextCtor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioContext = new AudioContextCtor();
    try {
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const channelData = audioBuffer.getChannelData(0);
      const sampleRate = audioBuffer.sampleRate;

      const windowSize = Math.floor(sampleRate * 0.05); // 50ms windows
      const hopSize = Math.floor(sampleRate * 0.025); // 50% overlap
      const energies: number[] = [];
      for (let start = 0; start + windowSize <= channelData.length; start += hopSize) {
        let sumSquares = 0;
        for (let i = 0; i < windowSize; i++) {
          const sample = channelData[start + i];
          sumSquares += sample * sample;
        }
        energies.push(Math.sqrt(sumSquares / windowSize));
      }

      if (energies.length === 0) return [];

      const mean = energies.reduce((a, b) => a + b, 0) / energies.length;
      const variance = energies.reduce((a, b) => a + (b - mean) ** 2, 0) / energies.length;
      const stddev = Math.sqrt(variance);
      const threshold = mean + stddev * 1.4;

      const minSpacingWindows = Math.max(1, Math.round((sampleRate * 0.25) / hopSize)); // >=250ms apart
      const beats: number[] = [];
      let lastBeatIndex = -Infinity;
      for (let i = 1; i < energies.length - 1; i++) {
        const isLocalPeak = energies[i] > energies[i - 1] && energies[i] >= energies[i + 1];
        if (isLocalPeak && energies[i] > threshold && i - lastBeatIndex >= minSpacingWindows) {
          beats.push((i * hopSize) / sampleRate);
          lastBeatIndex = i;
        }
      }
      return beats;
    } finally {
      await audioContext.close();
    }
  })();

  cache.set(url, promise);
  promise.catch(() => cache.delete(url));
  return promise;
}
