import { FontFamily, FontInfo } from '@/banner/lib/base-canvas';

export function getFontInfo(
  fontSize: number,
  fontFamily: FontFamily,
): FontInfo {
  return {
    family: fontFamily,
    size: fontSize,
    value: `${fontSize}px "${fontFamily}"`,
  };
}
