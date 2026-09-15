'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { getSubjectTypeLabel, getSubjectTypeColor, getStatusColor } from '@/utils/helpers';

interface Subject {
  id: string;
  name: string;
  description?: string;
  grade: '11' | '12';
  track: 'ciencias' | 'humanidades' | 'ambos';
  type: 'materia' | 'electiva' | 'avanzado';
  capacity: number;
  active: boolean;
  sortOrder: number;
  occupied: number;
  available: number;
  occupancyRate: number;
}

export default function MateriasPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    grade: '12' as '11' | '12',
    track: 'ambos' as 'ciencias' | 'humanidades' | 'ambos',
    type: 'electiva' as 'materia' | 'electiva' | 'avanzado',
    capacity: 25,
    active: true,
    sortOrder: 0,
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/subjects');
      if (res.ok) {
        const data = await res.json();
        setSubjects(data);
      }
    } catch (err) {
      console.error('Error fetching subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingSubject ? `/api/subjects/${editingSubject.id}` : '/api/subjects';
      const method = editingSubject ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        fetchSubjects();
        resetForm();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al guardar');
      }
    } catch (err) {
      console.error('Error saving subject:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta materia?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/subjects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchSubjects();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al eliminar');
      }
    } catch (err) {
      console.error('Error deleting subject:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const res = await fetch(`/api/subjects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active }),
      });
      if (res.ok) {
        fetchSubjects();
      }
    } catch (err) {
      console.error('Error toggling subject:', err);
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      description: subject.description || '',
      grade: subject.grade,
      track: subject.track,
      type: subject.type,
      capacity: subject.capacity,
      active: subject.active,
      sortOrder: subject.sortOrder,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingSubject(null);
    setFormData({
      name: '',
      description: '',
      grade: '12',
      track: 'ambos',
      type: 'electiva',
      capacity: 25,
      active: true,
      sortOrder: 0,
    });
    setShowForm(false);
  };

  const handleExportExcel = async (grade: '11' | '12') => {
    try {
      const res = await fetch(`/api/export/excel?grade=${grade}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Estudiantes_${grade}_Grado.xlsx`;
        a.click();
      }
    } catch (err) {
      console.error('Error exporting Excel:', err);
    }
  };

  const handleExportPDF = async (type: string, subjectId?: string) => {
    try {
      const params = new URLSearchParams({ type });
      if (subjectId) params.set('subjectId', subjectId);
      const res = await fetch(`/api/export/pdf?${params}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Reporte_${type}.pdf`;
        a.click();
      }
    } catch (err) {
      console.error('Error exporting PDF:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Materias y Electivas</h1>
          <p className="text-secondary-600">Gestión de materias, electivas y cursos avanzados</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => handleExportExcel('11')} className="btn-secondary flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Exportar 11º
          </button>
          <button onClick={() => handleExportExcel('12')} className="btn-secondary flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Exportar 12º
          </button>
          <button onClick={() => handleExportPDF('all')} className="btn-secondary flex items-center gap-2">
            <FileText className="w-4 h-4" />
            PDF General
          </button>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nueva materia
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Materia</th>
                <th className="text-center">Grado</th>
                <th className="text-center">Bachillerato</th>
                <th className="text-center">Tipo</th>
                <th className="text-center">Cupos</th>
                <th className="text-center">Ocupados</th>
                <th className="text-center">Disponibles</th>
                <th className="text-center">% Ocupación</th>
                <th className="text-center">Estado</th>
                <th className="text-center">Orden</th>
                <th className="w-48">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => (
                <tr key={subject.id}>
                  <td>
                    <div>
                      <p className="font-medium">{subject.name}</p>
                      {subject.description && <p className="text-sm text-secondary-500">{subject.description}</p>}
                    </div>
                  </td>
                  <td className="text-center">{subject.grade}º</td>
                  <td className="text-center capitalize">{subject.track}</td>
                  <td className="text-center">
                    <span className={`badge ${getSubjectTypeColor(subject.type)}`}>
                      {getSubjectTypeLabel(subject.type)}
                    </span>
                  </td>
                  <td className="text-center">{subject.capacity}</td>
                  <td className="text-center">{subject.occupied}</td>
                  <td className="text-center">{subject.available}</td>
                  <td className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-24 h-2 bg-secondary-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            subject.occupancyRate >= 100 ? 'bg-red-500' : subject.occupancyRate >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(subject.occupancyRate, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-secondary-500">{subject.occupancyRate.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => handleToggleActive(subject.id, !subject.active)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        subject.active ? 'bg-primary-600' : 'bg-secondary-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          subject.active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="text-center">{subject.sortOrder}</td>
                  <td>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleEdit(subject)}
                        className="p-1.5 rounded hover:bg-secondary-100 text-secondary-500 hover:text-secondary-700"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleExportPDF('subject', subject.id)}
                        className="p-1.5 rounded hover:bg-secondary-100 text-secondary-500 hover:text-secondary-700"
                        title="PDF de esta materia"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(subject.id)}
                        disabled={deletingId === subject.id}
                        className="p-1.5 rounded hover:bg-red-50 text-red-500 hover:text-red-700"
                        title="Eliminar"
                      >
                        {deletingId === subject.id ? (
                          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {(showForm || editingSubject) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={resetForm}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-secondary-200 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingSubject ? 'Editar materia' : 'Nueva materia'}</h2>
              <button onClick={resetForm} className="p-2 rounded hover:bg-secondary-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Nombre *</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Grado *</label>
                  <select className="input" value={formData.grade} onChange={(e) => setFormData({ ...formData, grade: e.target.value as '11' | '12' })}>
                    <option value="11">11º</option>
                    <option value="12">12º</option>
                  </select>
                </div>
                <div>
                  <label className="label">Bachillerato *</label>
                  <select className="input" value={formData.track} onChange={(e) => setFormData({ ...formData, track: e.target.value as 'ciencias' | 'humanidades' | 'ambos' })}>
                    <option value="ambos">Ambos</option>
                    <option value="ciencias">Ciencias</option>
                    <option value="humanidades">Humanidades</option>
                  </select>
                </div>
                <div>
                  <label className="label">Tipo *</label>
                  <select className="input" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as 'materia' | 'electiva' | 'avanzado' })}>
                    <option value="materia">Materia regular</option>
                    <option value="electiva">Electiva</option>
                    <option value="avanzado">Curso avanzado</option>
                  </select>
                </div>
                <div>
                  <label className="label">Cupos *</label>
                  <input
                    type="number"
                    min="0"
                    className="input"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Orden de aparición</label>
                  <input
                    type="number"
                    min="0"
                    className="input"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div>
                <label className="label">Descripción</label>
                <textarea
                  rows={3}
                  className="input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="active" className="text-sm font-medium text-secondary-700">Activa</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={resetForm} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" className="btn-primary flex-1">
                  {editingSubject ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}