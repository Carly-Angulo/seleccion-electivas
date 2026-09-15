'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  X,
} from 'lucide-react';
import { formatDate, getGradeLabel, getTrackLabel, getStatusLabel, getStatusColor } from '@/utils/helpers';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  studentId: string;
  email: string;
  phone?: string;
  grade: '11' | '12';
  track: 'ciencias' | 'humanidades';
  observation?: string;
  status: 'pendiente' | 'confirmado' | 'procesado';
  createdAt: string;
  selections: {
    id: string;
    selectionType: string;
    subject: {
      id: string;
      name: string;
    };
  }[];
}

export default function EstudiantesPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    grade: '',
    track: '',
    status: '',
    subject: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusChange, setStatusChange] = useState<{ id: string; status: string } | null>(null);

  useEffect(() => {
    fetchStudents();
  }, [search, filters]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filters.grade) params.set('grade', filters.grade);
      if (filters.track) params.set('track', filters.track);
      if (filters.status) params.set('status', filters.status);
      if (filters.subject) params.set('subject', filters.subject);

      const res = await fetch(`/api/admin/students?${params}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este estudiante?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/students/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchStudents();
      }
    } catch (err) {
      console.error('Error deleting student:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/students/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchStudents();
      }
    } catch (err) {
      console.error('Error changing status:', err);
    }
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

  const getElectivas = (student: Student) => {
    return student.selections
      .filter((s) => s.selectionType === 'electiva1' || s.selectionType === 'electiva2')
      .map((s) => s.subject.name)
      .join(', ');
  };

  const getAvanzado = (student: Student) => {
    const adv = student.selections.find((s) => s.selectionType === 'avanzado');
    return adv?.subject.name || '-';
  };

  const getMaterias = (student: Student) => {
    return student.selections
      .map((s) => s.subject.name)
      .join(', ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Estudiantes</h1>
          <p className="text-secondary-600">Gestión de estudiantes registrados</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => handleExportExcel('11')} className="btn-secondary flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Exportar 11º Excel
          </button>
          <button onClick={() => handleExportExcel('12')} className="btn-secondary flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Exportar 12º Excel
          </button>
          <button onClick={() => handleExportPDF('all')} className="btn-secondary flex items-center gap-2">
            <FileText className="w-4 h-4" />
            PDF General
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, apellido, ID, correo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-outline flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtros {Object.values(filters).some(v => v) && (
              <span className="badge bg-primary-100 text-primary-800">
                {Object.values(filters).filter(v => v).length}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 grid gap-4 sm:grid-cols-4">
            <select
              value={filters.grade}
              onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
              className="input"
            >
              <option value="">Todos los grados</option>
              <option value="11">11º</option>
              <option value="12">12º</option>
            </select>
            <select
              value={filters.track}
              onChange={(e) => setFilters({ ...filters, track: e.target.value })}
              className="input"
            >
              <option value="">Todos los bachilleratos</option>
              <option value="ciencias">Ciencias</option>
              <option value="humanidades">Humanidades</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input"
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmado">Confirmado</option>
              <option value="procesado">Procesado</option>
            </select>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilters({ grade: '', track: '', status: '', subject: '' })}
                className="btn-ghost text-sm"
              >
                <X className="w-4 h-4" />
                Limpiar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-secondary-500">Cargando estudiantes...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-secondary-500">
            <p>No se encontraron estudiantes</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>ID</th>
                  <th>Grado</th>
                  <th>Bachillerato</th>
                  <th>Electiva 1</th>
                  <th>Electiva 2</th>
                  <th>Curso Avanzado</th>
                  <th>Fecha registro</th>
                  <th>Estado</th>
                  <th className="w-40">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td className="font-medium">{student.firstName}</td>
                    <td>{student.lastName}</td>
                    <td className="font-mono text-sm">{student.studentId}</td>
                    <td className="text-center">{getGradeLabel(student.grade)}</td>
                    <td className="text-center capitalize">{getTrackLabel(student.track)}</td>
                    <td>
                      {student.grade === '12' ? (
                        student.selections.find(s => s.selectionType === 'electiva1')?.subject.name || '-'
                      ) : (
                        getMaterias(student)
                      )}
                    </td>
                    <td>
                      {student.grade === '12' ? (
                        student.selections.find(s => s.selectionType === 'electiva2')?.subject.name || '-'
                      ) : '-'}
                    </td>
                    <td>
                      {student.grade === '12' ? getAvanzado(student) : '-'}
                    </td>
                    <td className="text-sm">{formatDate(student.createdAt)}</td>
                    <td className="text-center">
                      <span className={`badge ${getStatusColor(student.status)}`}>
                        {getStatusLabel(student.status)}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setViewingStudent(student)}
                          className="p-1.5 rounded hover:bg-secondary-100 text-secondary-500 hover:text-secondary-700"
                          title="Ver"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingStudent(student)}
                          className="p-1.5 rounded hover:bg-secondary-100 text-secondary-500 hover:text-secondary-700"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <select
                          value={student.status}
                          onChange={(e) => handleStatusChange(student.id, e.target.value)}
                          disabled={statusChange?.id === student.id}
                          className="text-xs border border-secondary-200 rounded px-2 py-1 bg-white"
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="confirmado">Confirmado</option>
                          <option value="procesado">Procesado</option>
                        </select>
                        <button
                          onClick={() => handleDelete(student.id)}
                          disabled={deletingId === student.id}
                          className="p-1.5 rounded hover:bg-red-50 text-red-500 hover:text-red-700"
                          title="Eliminar"
                        >
                          {deletingId === student.id ? (
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
        )}
      </div>

      {/* View Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setViewingStudent(null)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-secondary-200 flex items-center justify-between">
              <h2 className="text-xl font-bold">Detalle del estudiante</h2>
              <button onClick={() => setViewingStudent(null)} className="p-2 rounded hover:bg-secondary-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><p className="text-sm text-secondary-500">Nombre</p><p className="font-medium">{viewingStudent.firstName}</p></div>
                <div><p className="text-sm text-secondary-500">Apellido</p><p className="font-medium">{viewingStudent.lastName}</p></div>
                <div><p className="text-sm text-secondary-500">Identificación</p><p className="font-mono">{viewingStudent.studentId}</p></div>
                <div><p className="text-sm text-secondary-500">Correo</p><p>{viewingStudent.email}</p></div>
                <div><p className="text-sm text-secondary-500">Teléfono</p><p>{viewingStudent.phone || '-'}</p></div>
                <div><p className="text-sm text-secondary-500">Grado</p><p>{getGradeLabel(viewingStudent.grade)}</p></div>
                <div><p className="text-sm text-secondary-500">Bachillerato</p><p className="capitalize">{getTrackLabel(viewingStudent.track)}</p></div>
                <div><p className="text-sm text-secondary-500">Estado</p><p><span className={`badge ${getStatusColor(viewingStudent.status)}`}>{getStatusLabel(viewingStudent.status)}</span></p></div>
                <div><p className="text-sm text-secondary-500">Fecha registro</p><p>{formatDate(viewingStudent.createdAt)}</p></div>
              </div>
              <div>
                <p className="text-sm text-secondary-500">Selecciones</p>
                <ul className="mt-2 space-y-1">
                  {viewingStudent.selections.map((sel) => (
                    <li key={sel.id} className="flex justify-between text-sm">
                      <span>{sel.subject.name}</span>
                      <span className="text-secondary-500 capitalize">{sel.selectionType.replace('electiva', 'Electiva ').replace('avanzado', 'Curso Avanzado')}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {viewingStudent.observation && (
                <div>
                  <p className="text-sm text-secondary-500">Observaciones</p>
                  <p className="mt-2 p-3 bg-secondary-50 rounded-lg">{viewingStudent.observation}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setEditingStudent(null)}>
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-secondary-200 flex items-center justify-between">
              <h2 className="text-xl font-bold">Editar estudiante</h2>
              <button onClick={() => setEditingStudent(null)} className="p-2 rounded hover:bg-secondary-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <StudentEditForm student={editingStudent} onClose={() => setEditingStudent(null)} onSuccess={fetchStudents} />
          </div>
        </div>
      )}
    </div>
  );
}

function StudentEditForm({ student, onClose, onSuccess }: { student: Student; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    firstName: student.firstName,
    lastName: student.lastName,
    studentId: student.studentId,
    email: student.email,
    phone: student.phone || '',
    status: student.status,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/students/${student.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Error al actualizar');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
      <div>
        <label className="label">Nombre</label>
        <input type="text" className="input" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required />
      </div>
      <div>
        <label className="label">Apellido</label>
        <input type="text" className="input" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required />
      </div>
      <div>
        <label className="label">Identificación</label>
        <input type="text" className="input" value={formData.studentId} onChange={(e) => setFormData({ ...formData, studentId: e.target.value })} required />
      </div>
      <div>
        <label className="label">Correo</label>
        <input type="email" className="input" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
      </div>
      <div>
        <label className="label">Teléfono</label>
        <input type="tel" className="input" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
      </div>
      <div>
        <label className="label">Estado</label>
        <select className="input" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}>
          <option value="pendiente">Pendiente</option>
          <option value="confirmado">Confirmado</option>
          <option value="procesado">Procesado</option>
        </select>
      </div>
      <div className="flex gap-3 pt-4">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  );
}