import { canvasSizeOptions, ratioMap } from './constant';

export function getAspectRatioLabel(
  width: number,
  height: number,
): string | undefined {
  const ratio = (width / height).toFixed(2);
  return ratioMap[ratio];
}

export function findMatchingCanvasSize(baseLayer: Canvas) {
  const ratioLabel = getAspectRatioLabel(baseLayer.width, baseLayer.height);
  if (!ratioLabel) return null;
  const ratioGroup = canvasSizeOptions.find((opt) => opt.value === ratioLabel);
  if (!ratioGroup) return null;
  const matchedSize = ratioGroup.sizes.find(
    (s) => s.width === baseLayer.width && s.height === baseLayer.height,
  );
  return (
    matchedSize ?? {
      label: `${baseLayer.width} x ${baseLayer.height}`,
      width: baseLayer.width,
      height: baseLayer.height,
    }
  );
}
