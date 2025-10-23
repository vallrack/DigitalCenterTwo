// /src/app/odontology/odontogram-summary.tsx
"use client";

import { OdontogramState } from "@/lib/types";

// Mapping from internal condition keys to human-readable names
const conditionNames: { [key: string]: string } = {
    "present": "Presente",
    "absent": "Ausente",
    "caries": "Caries",
    "restoration": "Restauración",
    "endodontics": "Endodoncia",
    "extraction": "Para Extracción",
    "crown": "Corona",
    "implant": "Implante",
    "sealant": "Sellante",
    "bridge": "Puente",
    "fracture": "Fractura",
};

const getConditionName = (condition: string) => conditionNames[condition] || condition;

interface OdontogramSummaryProps {
  odontogramState: OdontogramState;
}

interface Finding {
    tooth: string;
    status: string;
    conditions: string[];
}

export function OdontogramSummary({ odontogramState }: OdontogramSummaryProps) {
  const findings: Finding[] = Object.entries(odontogramState)
    .map(([tooth, state]) => ({
      tooth,
      status: getConditionName(state.status),
      // Defensive check: use empty array if conditions are missing
      conditions: (state.conditions || []).map(getConditionName),
    }))
    .filter(finding => finding.status !== 'Presente' || finding.conditions.length > 0);

  if (findings.length === 0) {
    return (
      <div className="mt-6 print:mt-4">
        <h3 className="text-lg font-semibold mb-2">Resumen del Odontograma</h3>
        <p className="text-sm text-gray-600">Sin observaciones particulares en el odontograma.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 print:mt-4">
      <h3 className="text-lg font-semibold mb-2">Resumen del Odontograma</h3>
      <div className="p-4 border rounded-md bg-gray-50 max-h-40 overflow-y-auto print:border-none print:bg-transparent print:p-0 print:max-h-full">
        <ul className="space-y-2">
          {findings.map(({ tooth, status, conditions }) => (
            <li key={tooth} className="text-sm print:text-xs">
              <span className="font-semibold">Diente {tooth}:</span> {status}
              {conditions.length > 0 && (
                <span className="text-gray-700"> - {conditions.join(', ')}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
