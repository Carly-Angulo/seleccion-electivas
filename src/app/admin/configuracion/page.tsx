'use client';

import { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';

interface SelectionRule {
  grade: '11' | '12';
  minElectives: number;
  maxElectives: number;
}

export default function ConfiguracionPage() {
  const [rules, setRules] = useState<SelectionRule[]>([
    { grade: '11', minElectives: 0, maxElectives: 5 },
    { grade: '12', minElectives: 2, maxElectives: 2 },
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const res = await fetch('/api/admin/rules');
      if (res.ok) {
        const data = await res.json();
        setRules(data);
      }
    } catch (err) {
      console.error('Error fetching rules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (grade: '11' | '12') => {
    const rule = rules.find(r => r.grade === grade);
    if (!rule) return;

    setSaving(true);
    try {
      const res = await fetch('/api/admin/rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rule),
      });
      if (res.ok) {
        fetchRules();
      } else {
        alert('Error al guardar');
      }
    } catch (err) {
      console.error('Error saving rule:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (grade: '11' | '12', field: 'minElectives' | 'maxElectives', value: number) => {
    setRules(prev => prev.map(r => r.grade === grade ? { ...r, [field]: value } : r));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Configuración</h1>
        <p className="text-secondary-600">Reglas de selección y parámetros del sistema</p>
      </div>

      <div className="card p-6 space-y-8">
        <div>
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Reglas de selección</h2>
          <p className="text-secondary-600 mb-6">
            Define el número mínimo y máximo de electivas que los estudiantes pueden seleccionar por grado.
          </p>

          {rules.map((rule) => (
            <div key={rule.grade} className="border border-secondary-200 rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-medium text-secondary-900">
                {rule.grade}º Grado
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Mínimo de electivas</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    className="input"
                    value={rule.minElectives}
                    onChange={(e) => handleChange(rule.grade, 'minElectives', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="label">Máximo de electivas</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    className="input"
                    value={rule.maxElectives}
                    onChange={(e) => handleChange(rule.grade, 'maxElectives', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleSave(rule.grade)}
                  disabled={saving}
                  className="btn-primary flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
                <button
                  onClick={fetchRules}
                  className="btn-outline flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Restablecer
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-secondary-200">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Información del sistema</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-secondary-600">Versión</dt>
              <dd className="font-medium">1.0.0</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-secondary-600">Base de datos</dt>
              <dd className="font-medium">Turso (SQLite)</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-secondary-600">ORM</dt>
              <dd className="font-medium">Drizzle ORM</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-secondary-600">Framework</dt>
              <dd className="font-medium">Next.js 14</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}