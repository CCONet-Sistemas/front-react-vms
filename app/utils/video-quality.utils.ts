/**
 * Utility functions for video quality display
 */

import { VIDEO_QUALITY_PRESETS, getQualityFromResolution } from '~/types';

/**
 * Format resolution as quality label for display
 * @example formatResolutionDisplay(1920, 1080) // "Full HD (1920x1080)"
 */
export function formatResolutionDisplay(width?: number, height?: number): string {
  if (!width || !height) return 'Não configurado';

  const quality = getQualityFromResolution(width, height);

  if (quality === 'custom') {
    return `${width}x${height}`;
  }

  const preset = VIDEO_QUALITY_PRESETS[quality];
  return `${preset.label} (${width}x${height})`;
}

/**
 * Get short quality label from resolution
 * @example getQualityLabel(1920, 1080) // "Full HD"
 */
export function getQualityLabel(width?: number, height?: number): string {
  if (!width || !height) return 'N/A';

  const quality = getQualityFromResolution(width, height);

  if (quality === 'custom') {
    return `${width}x${height}`;
  }

  return VIDEO_QUALITY_PRESETS[quality].label;
}

/**
 * Format FPS for display
 * @example formatFPS(30) // "30 FPS"
 */
export function formatFPS(fps?: number): string {
  if (!fps) return 'N/A';
  return `${fps} FPS`;
}
