'use client';

import { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Filter,
  X,
  Calendar,
  ChevronDown,
  Download,
} from 'lucide-react';
import { formatDateShort } from '@/utils/helpers';

interface ReportStudent {
  id: string;
  firstName: string;
  lastName: string;
  studentId: string;
  email: string;
  grade: '11' | '12';
  track: 'ciencias' | 'humanidades';
  status: 'pendiente' | 'confirmado' | 'procesado';
  createdAt: string;
  selections: {
    selectionType: string;
    subject: { name: string };
  }[];
}

export default function ReportesPage() {
  const [students, setStudents] = useState<ReportStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    grade: '',
    track: '',
    status: '',
    subject: '',
    dateFrom: '',
    dateTo: '',
  });
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await fetch('/api/subjects?active=true');
      if (res.ok) {
        const data = await res.json();
        setSubjects(data);
      }
    } catch (err) {
      console.error('Error fetching subjects:', err);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      const res = await fetch(`/api/reports?${params}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students);
      }
    } catch (err) {
      console.error('Error fetching report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async (grade: '11' | '12') => {
    try {
      const params = new URLSearchParams({ grade });
      Object.entries(filters).forEach(([key, value]) => {
        if (value && key !== 'grade') params.set(key, value);
      });
      const res = await fetch(`/api/export/excel?${params}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Reporte_${grade}_Grado.xlsx`;
        a.click();
      }
    } catch (err) {
      console.error('Error exporting Excel:', err);
    }
  };

  const handleExportPDF = async (type: string) => {
    try {
      const params = new URLSearchParams({ type });
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
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

  const getElectivas = (student: ReportStudent) => {
    return student.selections
      .filter((s) => s.selectionType === 'electiva1' || s.selectionType === 'electiva2')
      .map((s) => s.subject.name)
      .join(', ');
  };

  const getMaterias = (student: ReportStudent) => {
    return student.selections.map((s) => s.subject.name).join(', ');
  };

  const getAvanzado = (student: ReportStudent) => {
    return student.selections.find((s) => s.selectionType === 'avanzado')?.subject.name || '-';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Reportes</h1>
        <p className="text-secondary-600">Genera reportes filtrados y exporta a Excel o PDF</p>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
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
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => handleExportExcel('11')} className="btn-secondary flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Excel 11º
            </button>
            <button onClick={() => handleExportExcel('12')} className="btn-secondary flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Excel 12º
            </button>
            <button onClick={() => handleExportPDF('all')} className="btn-secondary flex items-center gap-2">
              <FileText className="w-4 h-4" />
              PDF General
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              <select
                value={filters.subject}
                onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                className="input"
              >
                <option value="">Todas las materias</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Fecha desde</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <input
                    type="date"
                    className="input pl-10"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="label">Fecha hasta</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <input
                    type="date"
                    className="input pl-10"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={fetchReport} disabled={loading} className="btn-primary">
                {loading ? 'Generando...' : 'Generar reporte'}
              </button>
              <button onClick={() => setFilters({ grade: '', track: '', status: '', subject: '', dateFrom: '', dateTo: '' })} className="btn-ghost">
                <X className="w-4 h-4 mr-1" />
                Limpiar filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Table */}
      <div className="card">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-secondary-500">Generando reporte...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-secondary-500">
            <p>No se encontraron resultados. Ajusta los filtros y genera el reporte.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>ID</th>
                  <th>Correo</th>
                  <th className="text-center">Grado</th>
                  <th className="text-center">Bachillerato</th>
                  <th>Materias / Electivas</th>
                  <th>Curso Avanzado</th>
                  <th>Estado</th>
                  <th>Fecha registro</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td className="font-medium">{student.firstName}</td>
                    <td>{student.lastName}</td>
                    <td className="font-mono text-sm">{student.studentId}</td>
                    <td>{student.email}</td>
                    <td className="text-center">{student.grade}º</td>
                    <td className="text-center capitalize">{student.track}</td>
                    <td>
                      {student.grade === '12' ? getElectivas(student) : getMaterias(student)}
                    </td>
                    <td>{student.grade === '12' ? getAvanzado(student) : '-'}</td>
                    <td className="text-center">
                      <span className={`badge ${getStatusColor(student.status)}`}>
                        {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                      </span>
                    </td>
                    <td className="text-sm">{formatDateShort(student.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}