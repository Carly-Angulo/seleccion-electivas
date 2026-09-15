'use client';

import { useState, useEffect } from 'react';
import { StudentForm } from '@/components/student/StudentForm';
import { SubjectsLoader } from '@/components/student/SubjectsLoader';

export default function EstudiantePage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    studentId: '',
    email: '',
    phone: '',
    grade: '' as '11' | '12' | '',
    track: '' as 'ciencias' | 'humanidades' | '',
    electiva1: '',
    electiva2: '',
    avanzado: '',
    materias: [] as string[],
    observation: '',
  });
  const [subjects, setSubjects] = useState<any[]>([]);
  const [advancedCourses, setAdvancedCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [registrationNumber, setRegistrationNumber] = useState('');

  useEffect(() => {
    if (step === 4 && formData.grade) {
      loadSubjects();
    }
  }, [step, formData.grade]);

  const loadSubjects = async () => {
    try {
      const response = await fetch(`/api/subjects?grade=${formData.grade}&active=true`);
      if (response.ok) {
        const data = await response.json();
        setSubjects(data.filter((s: any) => s.type === 'electiva' || s.type === 'materia'));
        setAdvancedCourses(data.filter((s: any) => s.type === 'avanzado' && 
          (s.track === 'ambos' || s.track === formData.track)));
      }
    } catch (err) {
      console.error('Error loading subjects:', err);
    }
  };

  const handleNext = () => {
    // Validaciones por paso
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.studentId || !formData.email) {
        setError('Todos los campos son obligatorios');
        return;
      }
      if (!formData.email.includes('@')) {
        setError('Correo electrónico inválido');
        return;
      }
    }
    if (step === 2 && !formData.grade) {
      setError('Debes seleccionar un grado');
      return;
    }
    if (step === 3 && formData.grade === '12' && !formData.track) {
      setError('Debes seleccionar un bachillerato');
      return;
    }
    if (step === 4) {
      if (formData.grade === '12') {
        if (!formData.electiva1 || !formData.electiva2) {
          setError('Debes seleccionar exactamente dos electivas');
          return;
        }
        if (formData.electiva1 === formData.electiva2) {
          setError('No puedes seleccionar la misma electiva dos veces');
          return;
        }
      } else {
        if (formData.materias.length === 0) {
          setError('Debes seleccionar al menos una materia');
          return;
        }
      }
    }
    if (step === 5 && formData.grade === '12' && !formData.avanzado) {
      // Opcional, no validar
    }
    setError(null);
    setStep(step + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        materias: formData.grade === '11' ? formData.materias : undefined,
      };

      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar');
      }

      setSuccess(true);
      setRegistrationNumber(data.studentId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">¡Tu selección ha sido registrada correctamente!</h2>
          <p className="text-secondary-600 mb-6">Tu número de registro es:</p>
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
            <p className="text-2xl font-mono font-bold text-primary-900">{registrationNumber}</p>
          </div>
          <p className="text-secondary-600 mb-6">Guarda este número para futuras consultas.</p>
          <button
            onClick={() => {
              setSuccess(false);
              setStep(1);
              setFormData({
                firstName: '',
                lastName: '',
                studentId: '',
                email: '',
                phone: '',
                grade: '',
                track: '',
                electiva1: '',
                electiva2: '',
                avanzado: '',
                materias: [],
                observation: '',
              });
            }}
            className="btn-primary"
          >
            Nueva selección
          </button>
        </div>
      </div>
    );
  }

  const stepTitles = [
    'Datos personales',
    'Seleccionar grado',
    'Seleccionar bachillerato',
    'Seleccionar materias',
    'Cursos avanzados',
    'Observaciones',
    'Confirmación',
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {stepTitles.map((title, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  index + 1 < step
                    ? 'bg-primary-600 text-white'
                    : index + 1 === step
                    ? 'bg-primary-600 text-white'
                    : 'bg-secondary-200 text-secondary-500'
                }`}
              >
                {index + 1 < step ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              {index < stepTitles.length - 1 && (
                <div
                  className={`w-16 h-0.5 mx-2 ${
                    index + 1 < step ? 'bg-primary-600' : 'bg-secondary-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <p className="text-center text-secondary-600">Paso {step} de {stepTitles.length}: {stepTitles[step - 1]}</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" role="alert">
          {error}
        </div>
      )}

      {/* Step content */}
      <div className="card p-6">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-secondary-900">Datos personales</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="label">Nombre *</label>
                <input
                  id="firstName"
                  type="text"
                  className="input"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Juan"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="label">Apellido *</label>
                <input
                  id="lastName"
                  type="text"
                  className="input"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Pérez"
                />
              </div>
            </div>
            <div>
              <label htmlFor="studentId" className="label">Número de identificación / Código de estudiante *</label>
              <input
                id="studentId"
                type="text"
                className="input"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                placeholder="2024001"
              />
            </div>
            <div>
              <label htmlFor="email" className="label">Correo electrónico *</label>
              <input
                id="email"
                type="email"
                className="input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="juan.perez@colegio.edu"
              />
            </div>
            <div>
              <label htmlFor="phone" className="label">Teléfono (opcional)</label>
              <input
                id="phone"
                type="tel"
                className="input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+57 300 123 4567"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-secondary-900">Seleccionar grado</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {['11', '12'].map((grade) => (
                <button
                  key={grade}
                  type="button"
                  onClick={() => setFormData({ ...formData, grade: grade as '11' | '12' })}
                  className={`p-6 rounded-xl border-2 text-center transition-all ${
                    formData.grade === grade
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-secondary-200 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  <div className="text-4xl font-bold text-primary-600">{grade}º</div>
                  <div className="text-sm text-secondary-600 mt-1">Grado {grade}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-secondary-900">Seleccionar bachillerato</h3>
            <p className="text-secondary-600">Grado seleccionado: <strong>{formData.grade}º</strong></p>
            <div className="grid gap-4 sm:grid-cols-2">
              {['ciencias', 'humanidades'].map((track) => (
                <button
                  key={track}
                  type="button"
                  onClick={() => setFormData({ ...formData, track: track as 'ciencias' | 'humanidades' })}
                  className={`p-6 rounded-xl border-2 text-center transition-all ${
                    formData.track === track
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-secondary-200 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  <div className="text-2xl font-bold text-primary-600 capitalize">{track}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <SubjectsLoader
            grade={formData.grade as '11' | '12'}
            track={formData.track as 'ciencias' | 'humanidades'}
            subjects={subjects}
            selectedElectivas={[formData.electiva1, formData.electiva2]}
            selectedMaterias={formData.materias}
            selectedAvanzado={formData.avanzado}
            onSelectElectiva={(id, index) => {
              if (index === 0) setFormData({ ...formData, electiva1: id });
              else setFormData({ ...formData, electiva2: id });
            }}
            onSelectMateria={(ids) => setFormData({ ...formData, materias: ids })}
            onSelectAvanzado={(id) => setFormData({ ...formData, avanzado: id })}
          />
        )}

        {step === 5 && formData.grade === '12' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-secondary-900">Cursos avanzados (opcional)</h3>
            <p className="text-secondary-600">¿Deseas optar por cursos avanzados? Puedes seleccionar uno.</p>
            <div className="grid gap-4">
              {advancedCourses.map((course) => (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, avanzado: formData.avanzado === course.id ? '' : course.id })}
                  disabled={course.available <= 0}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    formData.avanzado === course.id
                      ? 'border-primary-500 bg-primary-50'
                      : course.available <= 0
                      ? 'border-secondary-200 bg-secondary-50 cursor-not-allowed opacity-50'
                      : 'border-secondary-200 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-secondary-900">{course.name}</div>
                      {course.description && <div className="text-sm text-secondary-500">{course.description}</div>}
                    </div>
                    <div className="text-sm">
                      <span className={`badge ${course.available > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {course.available > 0 ? `${course.available} cupos` : 'CUPO LLENO'}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
              {advancedCourses.length === 0 && (
                <div className="text-center py-8 text-secondary-500">
                  No hay cursos avanzados disponibles para tu bachillerato.
                </div>
              )}
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-secondary-900">Observaciones</h3>
            <textarea
              id="observation"
              rows={4}
              className="input"
              value={formData.observation}
              onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
              placeholder="En caso de no quedar en ninguna de las electivas seleccionadas, ¿cuál es tu otra opción?"
            />
          </div>
        )}

        {step === 7 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-secondary-900">Confirmación</h3>
            <p className="text-secondary-600">Revisa tu selección antes de confirmar:</p>
            <div className="bg-secondary-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between"><span className="text-secondary-600">Estudiante:</span> <strong>{formData.firstName} {formData.lastName}</strong></div>
              <div className="flex justify-between"><span className="text-secondary-600">Identificación:</span> <strong>{formData.studentId}</strong></div>
              <div className="flex justify-between"><span className="text-secondary-600">Correo:</span> <strong>{formData.email}</strong></div>
              <div className="flex justify-between"><span className="text-secondary-600">Grado:</span> <strong>{formData.grade}º</strong></div>
              {formData.grade === '12' && (
                <div className="flex justify-between"><span className="text-secondary-600">Bachillerato:</span> <strong>{formData.track.charAt(0).toUpperCase() + formData.track.slice(1)}</strong></div>
              )}
              {formData.grade === '12' ? (
                <>
                  <div className="flex justify-between"><span className="text-secondary-600">Electiva 1:</span> <strong>{subjects.find(s => s.id === formData.electiva1)?.name}</strong></div>
                  <div className="flex justify-between"><span className="text-secondary-600">Electiva 2:</span> <strong>{subjects.find(s => s.id === formData.electiva2)?.name}</strong></div>
                  {formData.avanzado && (
                    <div className="flex justify-between"><span className="text-secondary-600">Curso avanzado:</span> <strong>{advancedCourses.find(s => s.id === formData.avanzado)?.name}</strong></div>
                  )}
                </>
              ) : (
                <div className="flex justify-between"><span className="text-secondary-600">Materias:</span> <strong>{formData.materias.map(id => subjects.find(s => s.id === id)?.name).filter(Boolean).join(', ')}</strong></div>
              )}
              {formData.observation && (
                <div className="flex justify-between"><span className="text-secondary-600">Observación:</span> <strong>{formData.observation}</strong></div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={handleBack}
          disabled={step === 1}
          className="btn-secondary"
        >
          ← Anterior
        </button>
        <div className="flex gap-3">
          {step < 7 ? (
            <button onClick={handleNext} className="btn-primary">
              Siguiente →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} className="btn-primary">
              {loading ? 'Registrando...' : 'Confirmar selección'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}