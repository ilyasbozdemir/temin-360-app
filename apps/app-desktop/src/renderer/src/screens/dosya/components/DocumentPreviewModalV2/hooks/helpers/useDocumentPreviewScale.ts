import { useEffect, useState } from "react";

interface UseDocumentPreviewScaleParams {
  isOpen: boolean;
  orientation: "portrait" | "landscape";
  zoomMode: "auto" | "manual";
  manualZoom: number;
  previewContainerRef: React.RefObject<HTMLDivElement | null>;
}

export function useDocumentPreviewScale({
  isOpen,
  orientation,
  zoomMode,
  manualZoom,
  previewContainerRef,
}: UseDocumentPreviewScaleParams): number {
  const [previewScale, setPreviewScale] = useState(1);

  useEffect(() => {
    if (zoomMode === "manual") {
      setPreviewScale(manualZoom);
      return;
    }
    const container = previewContainerRef.current;
    if (!container || !isOpen) return;

    const DOC_W = orientation === "landscape" ? 1131 : 800;
    const PADDING = 64; // py-8 = 32px * 2

    const recalculate = () => {
      const availableW = container.clientWidth - PADDING;
      if (availableW > 250 && availableW < DOC_W) {
        setPreviewScale(Math.round((availableW / DOC_W) * 1000) / 1000);
      } else {
        setPreviewScale(1);
      }
    };

    recalculate();

    const observer = new ResizeObserver(recalculate);
    observer.observe(container);
    return () => observer.disconnect();
  }, [isOpen, orientation, zoomMode, manualZoom, previewContainerRef]);

  return previewScale;
}
