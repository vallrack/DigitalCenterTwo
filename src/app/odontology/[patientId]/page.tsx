"use client";

import React, { useState, useRef, useEffect } from 'react';
import Odontograma3D, { Odontograma3DRef } from '../odontogram-3d';
import { Patient, OdontogramState } from '@/lib/types';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { getPatientById } from '@/services/odontology-service';

// Definición de la función generateDetailedPdf para que coincida con el uso
interface ExtendedOdontograma3DRef extends Odontograma3DRef {
  generateDetailedPdf: (patient: Patient, notes: string) => Promise<void>;
}

export default function OdontologyPage({ params }: { params: { patientId: string } }) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generalNotes, setGeneralNotes] = useState('');
  const [isNotesCollapsed, setIsNotesCollapsed] = useState(false);
  const odontogramRef = useRef<ExtendedOdontograma3DRef>(null);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        const patientData = await getPatientById(params.patientId);
        if (patientData) {
          setPatient(patientData);
          setGeneralNotes(patientData.generalNotes || '');
        } else {
          setError('Paciente no encontrado');
        }
      } catch (err) {
        setError('Error al cargar los datos del paciente');
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [params.patientId]);

  const handlePrint = () => {
    if (odontogramRef.current && patient) {
      odontogramRef.current.generateDetailedPdf(patient, generalNotes);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen">{error}</div>;
  }
  
  if (!patient) {
    return <div className="flex items-center justify-center h-screen">Paciente no encontrado</div>;
  }


  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center z-10">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Ficha del Paciente</h1>
        <div className="flex items-center space-x-4">
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-100">{patient.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">ID: {patient.id}</p>
          </div>
          <button 
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Imprimir Reporte
          </button>
        </div>
      </header>

      <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
        <div className="flex-grow h-full">
          <Odontograma3D 
            ref={odontogramRef as React.Ref<Odontograma3DRef>} // Casteo para compatibilidad
            initialState={patient.odontogramState || {}}
            onStateChange={() => {}} 
            isInteractive={true}
          />
        </div>
        <div className="md:w-1/4 bg-white dark:bg-gray-800 p-4 border-l dark:border-gray-700 flex flex-col transition-all duration-300">
            <div 
              className="flex justify-between items-center cursor-pointer pb-2 mb-4 border-b dark:border-gray-700"
              onClick={() => setIsNotesCollapsed(!isNotesCollapsed)}
            >
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Notas de la Consulta</h2>
              <button className="p-1 text-gray-600 dark:text-gray-400">
                {isNotesCollapsed ? <ChevronDown className="h-5 w-5"/> : <ChevronUp className="h-5 w-5"/>}
              </button>
            </div>
            {!isNotesCollapsed && (
                <textarea 
                    className="w-full flex-grow p-2 border rounded-md focus:ring-2 focus:ring-blue-500 transition resize-none bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                    placeholder="Escriba aquí las notas generales de la consulta..."
                    value={generalNotes}
                    onChange={(e) => setGeneralNotes(e.target.value)}
                />
            )}
        </div>
      </div>
    </div>
  );
}
