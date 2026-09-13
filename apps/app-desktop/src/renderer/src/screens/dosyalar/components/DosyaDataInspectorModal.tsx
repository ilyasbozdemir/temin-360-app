import React from "react";
import { createPortal } from "react-dom";
import { DosyaInspectorView } from "./inspector/DosyaInspectorView";

interface DosyaDataInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  dosya: any;
}

export const DosyaDataInspectorModal: React.FC<DosyaDataInspectorModalProps> = ({
  isOpen,
  onClose,
  dosya,
}) => {
  if (!isOpen || !dosya) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200"
      style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      onClick={onClose}
    >
      <DosyaInspectorView dosya={dosya} mode="modal" onClose={onClose} />
    </div>,
    document.body
  );
};
