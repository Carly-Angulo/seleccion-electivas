'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatDate } from '@/utils/helpers';

const COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'];

interface DashboardData {
  stats: {
    totalStudents: number;
    grade11Count: number;
    grade12Count: number;
    cienciasCount: number;
    humanidadesCount: number;
    totalSelections: number;
    totalAdvancedSelections: number;
  };
  charts: {
    studentsByGrade: { name: string; value: number }[];
    studentsByTrack: { name: string; value: number }[];
    electiveSelections: { name: string; value: number }[];
    advancedCourseSelections: { name: string; value: number }[];
    capacityData: {
      subject: string;
      total: number;
      occupied: number;
      available: number;
      occupancyRate: number;
    }[];
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-12 text-secondary-500">Error al cargar el dashboard</div>;
  }

  const { stats, charts } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
          <p className="text-secondary-600">Resumen de selecciones de electivas</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/estudiantes" className="btn-primary">
            Ver estudiantes
          </Link>
          <Link href="/admin/materias" className="btn-secondary">
            Gestionar materias
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Estudiantes" value={stats.totalStudents} icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" color="bg-primary-100 text-primary-600" />
        <StatCard title="11º Grado" value={stats.grade11Count} icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" color="bg-green-100 text-green-600" />
        <StatCard title="12º Grado" value={stats.grade12Count} icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" color="bg-blue-100 text-blue-600" />
        <StatCard title="Cursos Avanzados" value={stats.totalAdvancedSelections} icon="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" color="bg-purple-100 text-purple-600" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Ciencias" value={stats.cienciasCount} icon="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" color="bg-orange-100 text-orange-600" />
        <StatCard title="Humanidades" value={stats.humanidadesCount} icon="M4 6h16M4 12h16M4 18h16" color="bg-pink-100 text-pink-600" />
        <StatCard title="Total Selecciones" value={stats.totalSelections} icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" color="bg-indigo-100 text-indigo-600" />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Estudiantes por grado">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts.studentsByGrade}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip formatter={(value: number) => [value, 'estudiantes']} />
              <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Estudiantes por bachillerato">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={charts.studentsByTrack}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {charts.studentsByTrack.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [value, 'estudiantes']} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Selección de electivas" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={charts.electiveSelections} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#64748b" fontSize={12} />
              <YAxis dataKey="name" type="category" width={150} stroke="#64748b" fontSize={12} />
              <Tooltip formatter={(value: number) => [value, 'estudiantes']} />
              <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Cursos avanzados seleccionados">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={charts.advancedCourseSelections} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#64748b" fontSize={12} />
              <YAxis dataKey="name" type="category" width={180} stroke="#64748b" fontSize={12} />
              <Tooltip formatter={(value: number) => [value, 'estudiantes']} />
              <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Capacity Table */}
      <ChartCard title="Cupos por materia" className="lg:col-span-2">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Materia</th>
                <th className="text-center">Grado</th>
                <th className="text-center">Tipo</th>
                <th className="text-center">Cupos totales</th>
                <th className="text-center">Ocupados</th>
                <th className="text-center">Disponibles</th>
                <th className="text-center">% Ocupación</th>
                <th className="text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {charts.capacityData.map((item) => (
                <tr key={item.subject}>
                  <td className="font-medium">{item.subject}</td>
                  <td className="text-center">{item.grade}º</td>
                  <td className="text-center">
                    <span className={`badge ${getTypeColor(item.type)}`}>
                      {getTypeLabel(item.type)}
                    </span>
                  </td>
                  <td className="text-center">{item.total}</td>
                  <td className="text-center">{item.occupied}</td>
                  <td className="text-center">{item.available}</td>
                  <td className="text-center">
                    <div className="w-24 h-2 bg-secondary-200 rounded-full overflow-hidden mx-auto">
                      <div
                        className="h-full bg-primary-600 rounded-full transition-all"
                        style={{ width: `${Math.min(item.occupancyRate, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-secondary-500">{item.occupancyRate.toFixed(1)}%</span>
                  </td>
                  <td className="text-center">
                    <span className={`badge ${item.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {item.active ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-secondary-600">{title}</p>
          <p className="text-3xl font-bold text-secondary-900 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`card p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-secondary-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    materia: 'Materia',
    electiva: 'Electiva',
    avanzado: 'Avanzado',
  };
  return labels[type] || type;
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    materia: 'bg-blue-100 text-blue-800',
    electiva: 'bg-purple-100 text-purple-800',
    avanzado: 'bg-orange-100 text-orange-800',
  };
  return colors[type] || 'bg-secondary-100 text-secondary-800';
}