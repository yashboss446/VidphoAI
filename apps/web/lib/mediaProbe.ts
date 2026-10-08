import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import ffprobePath from 'ffprobe-static';
import { basename, dirname } from 'path';

ffmpeg.setFfmpegPath(ffmpegPath as unknown as string);
ffmpeg.setFfprobePath(ffprobePath.path);

export interface ProbeResult {
  durationSec?: number;
  width?: number;
  height?: number;
  fps?: number;
}

export function probeFile(localPath: string): Promise<ProbeResult> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(localPath, (err, data) => {
      if (err) return reject(err);
      const videoStream = data.streams.find((s) => s.codec_type === 'video');
      const [num, den] = (videoStream?.r_frame_rate ?? '0/1').split('/').map(Number);
      resolve({
        durationSec: data.format.duration,
        width: videoStream?.width,
        height: videoStream?.height,
        fps: den ? num / den : undefined,
      });
    });
  });
}

export function generateThumbnail(localPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(localPath)
      .on('end', () => resolve())
      .on('error', reject)
      .screenshots({
        count: 1,
        timestamps: ['1%'],
        filename: basename(outputPath),
        folder: dirname(outputPath),
      });
  });
}
