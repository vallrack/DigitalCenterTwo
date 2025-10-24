
"use client";

import { cn } from "@/lib/utils";

// Defines the parts of the tooth that can be selected
export type ToothSurface = "C" | "T" | "B" | "L" | "R";

interface ToothProps {
  toothNumber: number;
  selectedSurfaces: ToothSurface[];
  onSurfaceClick: (surface: ToothSurface) => void;
}

// A map to translate surface IDs to friendly names for aria-labels
const surfaceLabels: Record<ToothSurface, string> = {
  C: "Superior",
  T: "Frontal",
  B: "Trasera",
  L: "Izquierda",
  R: "Derecha",
};

/**
 * Renders an interactive SVG tooth inspired by the provided odontogram image.
 * Each of the 5 surfaces (Center, Top, Bottom, Left, Right) is individually clickable.
 */
export function Tooth({ toothNumber, selectedSurfaces, onSurfaceClick }: ToothProps) {
  const isSurfaceSelected = (surface: ToothSurface) => selectedSurfaces.includes(surface);

  // Base classes for any surface
  const surfaceBaseClasses = "transition-colors duration-150 cursor-pointer stroke-gray-600 stroke-2";
  // Classes for a selected surface
  const selectedClasses = "fill-blue-500 hover:fill-blue-600";
  // Classes for a non-selected surface
  const notSelectedClasses = "fill-white hover:fill-gray-200";

  return (
    <div className="flex flex-col items-center">
      <span className="text-sm font-semibold mb-1">{toothNumber}</span>
      <svg
        viewBox="0 0 50 50"
        width="50"
        height="50"
        xmlns="http://www.w3.org/2000/svg"
        aria-label={`Odontograma del diente ${toothNumber}`}
      >
        {/* Center (Oclusal) surface - Now labeled as "Superior" */}
        <circle
          cx="25"
          cy="25"
          r="10"
          className={cn(surfaceBaseClasses, isSurfaceSelected("C") ? selectedClasses : notSelectedClasses)}
          onClick={() => onSurfaceClick("C")}
          aria-label={`Superficie Superior del diente ${toothNumber}`}
        />
        {/* Top (Vestibular) surface - Now labeled as "Frontal" */}
        <path
          d="M 15,15 A 15,15 0 0,1 35,15 L 30,20 A 5,5 0 0,0 20,20 Z"
          className={cn(surfaceBaseClasses, isSurfaceSelected("T") ? selectedClasses : notSelectedClasses)}
          onClick={() => onSurfaceClick("T")}
          aria-label={`Superficie Frontal del diente ${toothNumber}`}
        />
        {/* Bottom (Lingual/Palatina) surface - Now labeled as "Trasera" */}
        <path
          d="M 15,35 A 15,15 0 0,0 35,35 L 30,30 A 5,5 0 0,1 20,30 Z"
          className={cn(surfaceBaseClasses, isSurfaceSelected("B") ? selectedClasses : notSelectedClasses)}
          onClick={() => onSurfaceClick("B")}
          aria-label={`Superficie Trasera del diente ${toothNumber}`}
        />
        {/* Left (Mesial) surface */}
        <path
          d="M 15,15 A 15,15 0 0,0 15,35 L 20,30 A 5,5 0 0,1 20,20 Z"
          className={cn(surfaceBaseClasses, isSurfaceSelected("L") ? selectedClasses : notSelectedClasses)}
          onClick={() => onSurfaceClick("L")}
          aria-label={`Superficie Izquierda del diente ${toothNumber}`}
        />
        {/* Right (Distal) surface */}
        <path
          d="M 35,15 A 15,15 0 0,1 35,35 L 30,30 A 5,5 0 0,0 30,20 Z"
          className={cn(surfaceBaseClasses, isSurfaceSelected("R") ? selectedClasses : notSelectedClasses)}
          onClick={() => onSurfaceClick("R")}
          aria-label={`Superficie Derecha del diente ${toothNumber}`}
        />
      </svg>
    </div>
  );
}
