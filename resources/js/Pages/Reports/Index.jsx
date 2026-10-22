import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    TrendingUp,
    Clock,
    DollarSign,
    Activity,
    BarChart3,
    Download,
    Users,
    PieChart,
} from 'lucide-react';

const formatMoney = (value) => {
    const number = Number(value) || 0;
    return '$' + number.toLocaleString('es-CO', { maximumFractionDigits: 0 });
};

const rangeOptions = [
    { value: 'month', label: 'Este mes' },
    { value: 'quarter', label: 'Último trimestre' },
    { value: 'year', label: 'Año actual' },
    { value: 'custom', label: 'Personalizado' },
];

export default function ReportsIndex({ kpis = {}, advisors = [], funnel = [], range = 'month', isSuperAdmin = false, organizations = [], filters = {} }) {
    const handleRangeChange = (newRange) => {
        router.get(
            route('reports.index'),
            { 
                range: newRange, 
                organization_id: filters.organization_id,
                fecha_inicio: newRange === 'custom' ? filters.fecha_inicio : '',
                fecha_fin: newRange === 'custom' ? filters.fecha_fin : '',
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleCustomDateChange = (field, val) => {
        router.get(
            route('reports.index'),
            { 
                range, 
                organization_id: filters.organization_id, 
                fecha_inicio: field === 'fecha_inicio' ? val : filters.fecha_inicio,
                fecha_fin: field === 'fecha_fin' ? val : filters.fecha_fin,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleOrganizationFilter = (orgId) => {
        router.get(
            route('reports.index'),
            { 
                range, 
                organization_id: orgId,
                fecha_inicio: filters.fecha_inicio,
                fecha_fin: filters.fecha_fin,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const exportExcel = () => {
        const rows = [
            ['Métrica', 'Valor'],
            ['Conversión (%)', kpis.conversionRate],
            ['Ciclo Promedio (días)', kpis.avgCycle],
            ['Valor Medio (COP)', kpis.avgValue],
            ['Actividad Efectiva (%)', kpis.effectiveActivity],
            ['Total Negocios', kpis.totalDeals],
            ['Negocios Ganados', kpis.wonDeals],
            [],
            ['Etapa Comercial', 'Valor (COP)', 'Negocios'],
            ...funnel.map((f) => [f.stage, f.value, f.count]),
            [],
            ['Asesor', 'Negocios', 'Ganados', 'Cumplimiento (%)'],
            ...advisors.map((a) => [a.name, a.total, a.won, a.compliance]),
        ];

        const csv = rows
            .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
            .join('\n');

        const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte_${range}_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const kpiCards = [
        {
            label: 'Conversión',
            value: kpis.conversionRate ?? 0,
            suffix: '%',
            Icon: TrendingUp,
            accent: 'bg-emerald-50 border border-emerald-200 text-emerald-600',
        },
        {
            label: 'Ciclo Promedio',
            value: kpis.avgCycle ?? 0,
            suffix: ' días',
            Icon: Clock,
            accent: 'bg-blue-50 border border-blue-200 text-blue-600',
        },
        {
            label: 'Valor Medio',
            value: formatMoney(kpis.avgValue ?? 0),
            suffix: ' COP',
            Icon: DollarSign,
            accent: 'bg-indigo-50 border border-indigo-200 text-indigo-600',
        },
        {
            label: 'Actividad Efectiva',
            value: kpis.effectiveActivity ?? 0,
            suffix: '%',
            Icon: Activity,
            accent: 'bg-cyan-50 border border-cyan-200 text-cyan-600',
        },
    ];

    const maxFunnelValue = Math.max(...funnel.map((f) => f.value), 1);
    const totalFunnelValue = funnel.reduce((acc, f) => acc + (f.value || 0), 0) || 1;

    return (
        <AuthenticatedLayout>
            <Head title="Reportes" />

            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <span className="text-[10px] font-black tracking-[0.2em] text-blue-600 uppercase">Análisis · Insights</span>
                        <h1 className="text-2xl font-black text-slate-900">Centro de <span className="text-blue-700">Reportes</span></h1>
                    </div>
                    <button
                        onClick={exportExcel}
                        className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:text-blue-700 hover:bg-blue-50 font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm text-sm"
                    >
                        <Download className="w-4 h-4" />
                        <span>↓ Exportar informe a Excel</span>
                    </button>
                </div>

                <div className="flex flex-col gap-3 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Rango de fechas:</span>
                            <div className="flex items-center bg-slate-100 rounded-lg p-1">
                                {rangeOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleRangeChange(option.value)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                                            range === option.value
                                                ? 'bg-blue-600 text-white shadow-sm'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {isSuperAdmin && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Organización:</span>
                                <select 
                                    value={filters.organization_id || ''}
                                    onChange={(e) => handleOrganizationFilter(e.target.value)}
                                    className="rounded-xl border-gray-200 text-sm font-medium py-1.5"
                                >
                                    <option value="">Todas las organizaciones</option>
                                    {organizations.map((org) => (
                                        <option key={org.id} value={org.id}>{org.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {range === 'custom' && (
                        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-600">Fecha inicio:</span>
                                <input 
                                    type="date"
                                    value={filters.fecha_inicio || ''}
                                    onChange={(e) => handleCustomDateChange('fecha_inicio', e.target.value)}
                                    className="rounded-xl border-gray-200 text-xs font-medium py-1.5 px-3"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-600">Fecha fin:</span>
                                <input 
                                    type="date"
                                    value={filters.fecha_fin || ''}
                                    onChange={(e) => handleCustomDateChange('fecha_fin', e.target.value)}
                                    className="rounded-xl border-gray-200 text-xs font-medium py-1.5 px-3"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* KPIs */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {kpiCards.map((card) => (
                        <div key={card.label} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{card.label}</p>
                                <div className={`p-2.5 rounded-xl ${card.accent}`}>
                                    <card.Icon className="w-5 h-5" />
                                </div>
                            </div>
                            <p className="text-3xl font-black text-gray-900">
                                {card.value}
                                {card.suffix && <span className="text-lg font-bold text-gray-500">{card.suffix}</span>}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Rendimiento por Asesor */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-extrabold text-gray-900 mb-1 flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600" />
                            Rendimiento por Asesor
                        </h2>
                        <p className="text-xs text-gray-500 mb-5">Porcentaje de cumplimiento por miembro del equipo</p>
                        {advisors.length > 0 ? (
                            <div className="space-y-5">
                                {advisors.map((advisor) => (
                                    <div key={advisor.id}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-sm font-semibold text-gray-800">{advisor.name}</span>
                                            <span className="text-xs font-bold text-gray-500">
                                                {advisor.won}/{advisor.total} · {advisor.compliance}%
                                            </span>
                                        </div>
                                        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
                                                style={{ width: `${advisor.compliance}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic py-6 text-center">Sin actividad registrada en el periodo.</p>
                        )}
                    </div>

                    {/* Valor por Etapa Comercial */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-extrabold text-gray-900 mb-1 flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-blue-600" />
                            Valor por Etapa Comercial
                        </h2>
                        <p className="text-xs text-gray-500 mb-5">Concentración del embudo por valor (COP)</p>
                        {funnel.length > 0 ? (
                            <div className="flex items-end gap-3 h-64">
                                {funnel.map((item) => (
                                    <div key={item.stage} className="flex-1 flex flex-col items-center justify-end h-full">
                                        <span className="text-[11px] font-bold text-gray-700 mb-1 whitespace-nowrap">
                                            {formatMoney(item.value)}
                                        </span>
                                        <div
                                            className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg transition-all duration-500"
                                            style={{ height: `${(item.value / maxFunnelValue) * 100}%`, minHeight: '2px' }}
                                        />
                                        <span className="text-[11px] font-bold text-gray-500 mt-2 text-center">{item.stage}</span>
                                        <span className="text-[10px] text-gray-400">{item.count} negocios</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic py-6 text-center">Sin datos en el periodo seleccionado.</p>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Gráfico Circular / Donut de Distribución por Etapa Comercial */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-extrabold text-gray-900 mb-1 flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-blue-600" />
                            Distribución Proporcional (Gráfico Circular)
                        </h2>
                        <p className="text-xs text-gray-500 mb-5">Participación porcentual del valor por etapa comercial</p>
                        {funnel.length > 0 ? (
                            <div className="space-y-4">
                                <div className="flex flex-wrap items-center justify-center gap-4 my-4">
                                    <div className="relative w-40 h-40 rounded-full flex items-center justify-center shadow-inner bg-slate-50 border-4 border-slate-100 overflow-hidden">
                                        <div 
                                            className="absolute inset-0 rounded-full"
                                            style={{
                                                background: `conic-gradient(
                                                    ${funnel.reduce((acc, item, index) => {
                                                        const colors = ['#2563eb', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
                                                        const prevPercent = acc.percent;
                                                        const currentPercent = prevPercent + ((item.value / totalFunnelValue) * 100);
                                                        acc.percent = currentPercent;
                                                        acc.stops.push(`${colors[index % colors.length]} ${prevPercent}% ${currentPercent}%`);
                                                        return acc;
                                                    }, { percent: 0, stops: [] }).stops.join(', ')}
                                                )`
                                            }}
                                        />
                                        <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                                            <span className="text-xs font-bold text-gray-400">Total</span>
                                            <span className="text-sm font-black text-gray-900">{formatMoney(totalFunnelValue)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    {funnel.map((item, index) => {
                                        const colors = ['bg-blue-600', 'bg-cyan-500', 'bg-emerald-500', 'bg-amber-500', 'bg-pink-500', 'bg-purple-500'];
                                        const percentage = totalFunnelValue > 0 ? Math.round((item.value / totalFunnelValue) * 100) : 0;
                                        return (
                                            <div key={item.stage} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
                                                <span className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                                                <div className="flex-1 truncate">
                                                    <p className="font-bold text-gray-800 truncate">{item.stage}</p>
                                                    <p className="text-[10px] text-gray-500">{formatMoney(item.value)} ({percentage}%)</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic py-6 text-center">Sin datos en el periodo seleccionado.</p>
                        )}
                    </div>

                    {/* Guía de Interpretación de Gráficos */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
                        <div>
                            <h2 className="text-lg font-extrabold text-gray-900 mb-2 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-blue-600" />
                                Guía de Interpretación de Gráficos
                            </h2>
                            <p className="text-xs text-gray-500 mb-5">Comprenda cómo analizar cada representación visual para la toma de decisiones comerciales.</p>
                            
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                                    <h3 className="text-sm font-bold text-blue-900 mb-1 flex items-center gap-2">
                                        📊 Diagrama de Barras
                                    </h3>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        Compara categorías o métricas individuales. Es ideal para evaluar el <strong>rendimiento o cumplimiento comercial por cada asesor</strong>, identificando fácilmente qué miembros destacan o necesitan apoyo.
                                    </p>
                                </div>

                                <div className="p-4 rounded-xl bg-cyan-50/50 border border-cyan-100">
                                    <h3 className="text-sm font-bold text-cyan-900 mb-1 flex items-center gap-2">
                                        ⭕ Diagrama Circular (Pie / Donut Chart)
                                    </h3>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        Muestra la distribución proporcional de un conjunto sobre el 100%. Permite visualizar de un vistazo la <strong>proporción de negocios distribuidos por cada etapa del embudo</strong> y la concentración de capital en negociación.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resumen */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        Resumen del Periodo
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-center">
                            <p className="text-2xl font-black text-gray-900">{kpis.totalDeals ?? 0}</p>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Negocios</p>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-center">
                            <p className="text-2xl font-black text-gray-900">{kpis.wonDeals ?? 0}</p>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ganados</p>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-center">
                            <p className="text-2xl font-black text-gray-900">{kpis.totalReservations ?? 0}</p>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reservas</p>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-center">
                            <p className="text-2xl font-black text-gray-900">{kpis.completedReservations ?? 0}</p>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Completadas</p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
