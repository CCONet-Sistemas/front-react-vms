/**
 * Video Quality Types and Constants
 * Defines standard video quality presets for streaming and recording
 */

export type VideoQuality = '4k' | 'fullhd' | 'hd' | 'sd' | 'low' | 'custom';

export interface VideoResolution {
  width: number;
  height: number;
  label: string;
  description?: string;
}

export const VIDEO_QUALITY_PRESETS: Record<VideoQuality, VideoResolution> = {
  '4k': {
    width: 3840,
    height: 2160,
    label: '4K Ultra HD',
    description: '3840x2160 (2160p)',
  },
  fullhd: {
    width: 1920,
    height: 1080,
    label: 'Full HD',
    description: '1920x1080 (1080p)',
  },
  hd: {
    width: 1280,
    height: 720,
    label: 'HD',
    description: '1280x720 (720p)',
  },
  sd: {
    width: 640,
    height: 480,
    label: 'SD',
    description: '640x480 (480p)',
  },
  low: {
    width: 320,
    height: 240,
    label: 'Baixa',
    description: '320x240 (240p)',
  },
  custom: {
    width: 0,
    height: 0,
    label: 'Personalizado',
    description: 'Definir resolução manualmente',
  },
};

/**
 * Get resolution dimensions from quality preset
 */
export function getResolutionFromQuality(quality: VideoQuality): VideoResolution {
  return VIDEO_QUALITY_PRESETS[quality];
}

/**
 * Detect quality preset from width and height
 * Returns 'custom' if no exact match is found
 */
export function getQualityFromResolution(width?: number, height?: number): VideoQuality {
  if (!width || !height) return 'custom';

  const entry = Object.entries(VIDEO_QUALITY_PRESETS).find(
    ([key, value]) => key !== 'custom' && value.width === width && value.height === height
  );

  return (entry?.[0] as VideoQuality) ?? 'custom';
}

/**
 * Get list of available quality options for select component
 */
export function getVideoQualityOptions(): Array<{ value: VideoQuality; label: string }> {
  return Object.entries(VIDEO_QUALITY_PRESETS)
    .filter(([key]) => key !== 'custom')
    .map(([key, value]) => ({
      value: key as VideoQuality,
      label: value.label,
    }));
}
