'use client';

import { memo } from 'react';

interface SubjectsLoaderProps {
  grade: '11' | '12';
  track: 'ciencias' | 'humanidades';
  subjects: any[];
  selectedElectivas: string[];
  selectedMaterias: string[];
  selectedAvanzado: string;
  onSelectElectiva: (id: string, index: number) => void;
  onSelectMateria: (ids: string[]) => void;
  onSelectAvanzado: (id: string) => void;
}

export const SubjectsLoader = memo(function SubjectsLoader({
  grade,
  track,
  subjects,
  selectedElectivas,
  selectedMaterias,
  onSelectElectiva,
  onSelectMateria,
}: SubjectsLoaderProps) {
  if (grade === '12') {
    const electivas = subjects.filter((s) => s.type === 'electiva');
    
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-secondary-900">Selecciona exactamente 2 electivas</h3>
        <p className="text-secondary-600">Debes elegir dos electivas diferentes. No se permite seleccionar la misma dos veces.</p>
        
        <div className="grid gap-4">
          {electivas.map((subject, index) => (
            <div key={subject.id} className="relative">
              <button
                type="button"
                onClick={() => onSelectElectiva(subject.id, selectedElectivas[0] === subject.id ? 0 : selectedElectivas[1] === subject.id ? 1 : (selectedElectivas[0] ? 1 : 0))}
                disabled={subject.available <= 0 && !selectedElectivas.includes(subject.id)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  selectedElectivas.includes(subject.id)
                    ? 'border-primary-500 bg-primary-50'
                    : subject.available <= 0
                    ? 'border-secondary-200 bg-secondary-50 cursor-not-allowed opacity-50'
                    : 'border-secondary-200 hover:border-primary-300 hover:bg-primary-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-secondary-900">{subject.name}</span>
                      {subject.available <= 0 && (
                        <span className="badge bg-red-100 text-red-800">CUPO LLENO</span>
                      )}
                    </div>
                    {subject.description && <div className="text-sm text-secondary-500 mt-1">{subject.description}</div>}
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="text-secondary-600">Cupos: {subject.capacity}</span>
                      <span className="text-secondary-600">Ocupados: {subject.occupied}</span>
                      <span className={subject.available > 0 ? 'text-green-600' : 'text-red-600'}>Disponibles: {subject.available}</span>
                    </div>
                  </div>
                  {selectedElectivas.includes(subject.id) && (
                    <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            </div>
          ))}
        </div>
        
        {selectedElectivas.length > 0 && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <p className="text-sm text-primary-800">
              <strong>Electivas seleccionadas:</strong>{' '}
              {selectedElectivas
                .map((id) => subjects.find((s) => s.id === id)?.name)
                .filter(Boolean)
                .join(', ')}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Grade 11 - multiple selection
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-secondary-900">Selecciona tus materias</h3>
      <p className="text-secondary-600">Puedes seleccionar múltiples materias.</p>
      
      <div className="grid gap-4">
        {subjects.map((subject) => (
          <button
            key={subject.id}
            type="button"
            onClick={() => {
              const newSelection = selectedMaterias.includes(subject.id)
                ? selectedMaterias.filter((id) => id !== subject.id)
                : [...selectedMaterias, subject.id];
              onSelectMateria(newSelection);
            }}
            disabled={subject.available <= 0 && !selectedMaterias.includes(subject.id)}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              selectedMaterias.includes(subject.id)
                ? 'border-primary-500 bg-primary-50'
                : subject.available <= 0
                ? 'border-secondary-200 bg-secondary-50 cursor-not-allowed opacity-50'
                : 'border-secondary-200 hover:border-primary-300 hover:bg-primary-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-secondary-900">{subject.name}</span>
                  {subject.available <= 0 && (
                    <span className="badge bg-red-100 text-red-800">CUPO LLENO</span>
                  )}
                </div>
                {subject.description && <div className="text-sm text-secondary-500 mt-1">{subject.description}</div>}
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="text-secondary-600">Cupos: {subject.capacity}</span>
                  <span className="text-secondary-600">Ocupados: {subject.occupied}</span>
                  <span className={subject.available > 0 ? 'text-green-600' : 'text-red-600'}>Disponibles: {subject.available}</span>
                </div>
              </div>
              {selectedMaterias.includes(subject.id) && (
                <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>
      
      {selectedMaterias.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <p className="text-sm text-primary-800">
            <strong>Materias seleccionadas ({selectedMaterias.length}):</strong>{' '}
            {selectedMaterias
              .map((id) => subjects.find((s) => s.id === id)?.name)
              .filter(Boolean)
              .join(', ')}
          </p>
        </div>
      )}
    </div>
  );
});