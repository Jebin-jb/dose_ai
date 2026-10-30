import React, { useState } from 'react';
import { BoundingBox, ExtractedMedicine } from '../types';
import { ZoomIn, ZoomOut, FileText, AlertCircle } from 'lucide-react';

interface BoundingBoxOverlayProps {
  imageUrl: string;
  medicines: ExtractedMedicine[];
  selectedMedicineId?: string | null;
  onSelectMedicine?: (id: string) => void;
}

export const BoundingBoxOverlay: React.FC<BoundingBoxOverlayProps> = ({
  imageUrl,
  medicines,
  selectedMedicineId,
  onSelectMedicine
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[#CBD5E1] bg-[#FAF8F3] shadow-sm">
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#F1EFE8] border-b border-[#CBD5E1] text-xs text-[#25312F]">
        <span className="font-medium flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-[#138A7B]" />
          Doctor's Handwritten Prescription Slip
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoomLevel((z) => Math.max(1, z - 0.25))}
            className="p-1 rounded hover:bg-[#E2E8F0] text-[#66736F]"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono w-9 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.25))}
            className="p-1 rounded hover:bg-[#E2E8F0] text-[#66736F]"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Image container with viewport scaling and bounding boxes */}
      <div className="relative w-full overflow-auto max-h-[340px] bg-[#FAF8F3] p-1">
        <div
          className="relative inline-block w-full transition-transform duration-200 origin-top-left"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <img
            src={imageUrl}
            alt="Prescription slip"
            className="w-full h-auto block select-none rounded-lg"
          />

          {/* Bounding box overlays */}
          {medicines.map((m) => {
            if (!m.bounding_box) return null;
            const isSelected = selectedMedicineId === m.id;
            const isAmbiguous = m.status === 'needs_clarification';

            // Clean, restrained border: no pulsing dots
            let borderColor = '#94A3B8';
            let bgColor = 'rgba(255, 255, 255, 0.1)';
            if (isSelected) {
              borderColor = isAmbiguous ? '#D99026' : '#138A7B';
              bgColor = isAmbiguous ? 'rgba(217, 144, 38, 0.18)' : 'rgba(19, 138, 123, 0.18)';
            } else if (isAmbiguous) {
              borderColor = 'rgba(217, 144, 38, 0.7)';
            }

            return (
              <div
                key={m.id}
                onClick={() => onSelectMedicine && onSelectMedicine(m.id)}
                className="absolute cursor-pointer transition-all duration-150 rounded"
                style={{
                  left: `${m.bounding_box.x}%`,
                  top: `${m.bounding_box.y}%`,
                  width: `${m.bounding_box.width}%`,
                  height: `${m.bounding_box.height}%`,
                  border: isSelected ? `2.5px solid ${borderColor}` : `1.5px dashed ${borderColor}`,
                  backgroundColor: bgColor,
                }}
                title={m.medicine_name_raw}
              >
                {/* Clean label tag - positioned inside if near top to avoid overlapping toolbar */}
                <div
                  className={`absolute ${
                    m.bounding_box.y < 8 ? 'top-1' : '-top-4'
                  } left-2 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 shadow-xs pointer-events-none select-none z-10 ${
                    isAmbiguous
                      ? 'bg-[#D99026] text-white'
                      : isSelected
                      ? 'bg-[#123F3A] text-white'
                      : 'bg-[#475569] text-white'
                  }`}
                >
                  {isAmbiguous ? <AlertCircle className="w-2.5 h-2.5" /> : null}
                  <span>{m.standardized_name ? m.standardized_name.split(' ')[0] : m.medicine_name_raw}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Caption note */}
      <div className="px-3 py-1.5 bg-[#FAF8F3] border-t border-[#CBD5E1] text-[11px] text-[#66736F] flex items-center justify-between">
        <span>Click any highlighted section above to compare handwriting.</span>
        <span className="text-[10px] text-[#25312F] font-medium">Source Document</span>
      </div>
    </div>
  );
};
