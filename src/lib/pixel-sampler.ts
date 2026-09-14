/**
 * Pure helpers for reading the pixel a user is pointing at on the card.
 *
 * The scene backdrop is rendered as `resizeMode="cover"` and then zoomed in by
 * `SCENE_SCALE` around the centre (see SceneBackdrop in link-card-view). To
 * map a tap on the card frame back to a source-image pixel we therefore need
 * to undo BOTH the cover fit and the centred zoom.
 *
 * SCENE_SCALE lives here (a pure, RN-free unit) so the picker and the card
 * always use the same value; link-card-view imports it from this module.
 */

/** Zoom factor the card applies to the scene image. */
export const SCENE_SCALE = 1.6;

/** Map a display point inside the card frame to source-image pixel coords. */
export function displayToSource(
  x: number,
  y: number,
  frameW: number,
  frameH: number,
  srcW: number,
  srcH: number,
): { sourceX: number; sourceY: number } {
  if (frameW <= 0 || frameH <= 0 || srcW <= 0 || srcH <= 0) {
    return { sourceX: 0, sourceY: 0 };
  }
  const frameRatio = frameW / frameH;
  const srcRatio = srcW / srcH;
  // Cover fit: the image fills the frame, cropping the overflowing axis.
  let scaledW = frameW;
  let scaledH = frameH;
  if (srcRatio > frameRatio) {
    // Image is wider: it spans the full width, taller than the frame.
    scaledH = frameW / srcRatio;
  } else {
    // Image is taller: it spans the full height, wider than the frame.
    scaledW = frameH * srcRatio;
  }
  const offX = (frameW - scaledW) / 2;
  const offY = (frameH - scaledH) / 2;

  // SceneBackdrop draws the cover-fitted image inside a frame-sized view that is
  // then scaled by SCENE_SCALE around the view centre. Undo that zoom first:
  // the visible frame point corresponds to this pre-scale point in frame coords.
  const preX = frameW / 2 + (x - frameW / 2) / SCENE_SCALE;
  const preY = frameH / 2 + (y - frameH / 2) / SCENE_SCALE;

  // If the (pre-scale) point is outside the cover-fitted content box, it is
  // veil/background, not image content.
  if (
    preX < offX ||
    preX > offX + scaledW ||
    preY < offY ||
    preY > offY + scaledH
  ) {
    return { sourceX: 0, sourceY: 0 };
  }

  const clampFrac = (v: number) => Math.max(0, Math.min(1, v));
  const sourceX = clampFrac((preX - offX) / scaledW) * srcW;
  const sourceY = clampFrac((preY - offY) / scaledH) * srcH;

  const maxX = Math.max(0, srcW - 1);
  const maxY = Math.max(0, srcH - 1);
  return {
    sourceX: Math.min(maxX, Math.max(0, Math.floor(sourceX))),
    sourceY: Math.min(maxY, Math.max(0, Math.floor(sourceY))),
  };
}

/** Read the RGBA pixel at a tile-local position from a decoded PNG tile. */
export function readTilePixel(
  buf: Uint8Array,
  tileW: number,
  tileH: number,
  localX: number,
  localY: number,
): { r: number; g: number; b: number; a: number } {
  const px = Math.min(tileW - 1, Math.max(0, Math.floor(localX)));
  const py = Math.min(tileH - 1, Math.max(0, Math.floor(localY)));
  const i = (py * tileW + px) * 4;
  return { r: buf[i], g: buf[i + 1], b: buf[i + 2], a: buf[i + 3] };
}

export function rgbaToHex(r: number, g: number, b: number): string {
  const hex = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`.toUpperCase();
}