import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Search, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function QuotationsIndex({ auth, quotations = [], kpis = {} }) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Valores KPI por defecto
    const openCount = kpis?.open_count ?? 2;
    const openValue = kpis?.open_value ?? '$47.600.000 COP';
    const acceptedCount = kpis?.accepted_count ?? 1;
    const conversionRate = kpis?.conversion_rate ?? '42%';

    // Listado fallback si no llegan datos del backend
    const quotationList = Array.isArray(quotations) && quotations.length > 0 ? quotations : [
        { id: 1, code: 'COT-2026-014', client: 'María López', company: 'Retail Commerce', product: 'Suscripción empresarial', date: '2026-08-10', total: '$19.040.000 COP', status: 'Enviada' },
        { id: 2, code: 'COT-2026-013', client: 'Carlos Díaz', company: 'Tech Innovate S.A.', product: 'Servicio de soporte', date: '2026-08-08', total: '$47.481.000 COP', status: 'Aceptada' },
        { id: 3, code: 'COT-2026-012', client: 'Juan Pérez', company: 'Soluciones Digitales', product: 'Consultoría estratégica', date: '2026-08-06', total: '$28.560.000 COP', status: 'Borrador' },
        { id: 4, code: 'COT-2026-011', client: 'Ana Silva', company: 'E-Commerce Global', product: 'Equipos y suministros', date: '2026-08-03', total: '$33.320.000 COP', status: 'Rechazada' },
    ];

    const getBadgeStyle = (status) => {
        switch (status) {
            case 'Aceptada': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Enviada': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Borrador': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-rose-100 text-rose-700 border-rose-200';
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Cotizaciones" />
            <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-xs font-semibold text-slate-500 uppercase">Abiertas</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{openCount}</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-xs font-semibold text-slate-500 uppercase">Valor Abierto</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{openValue}</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-xs font-semibold text-slate-500 uppercase">Aceptadas</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{acceptedCount}</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-xs font-semibold text-slate-500 uppercase">Conversión</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{conversionRate}</p>
                    </div>
                </div>

                {/* Tabla y Filtros */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row justify-between gap-4">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar número, cliente o empresa..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none"
                        >
                            <option value="">Todos los estados</option>
                            <option value="Aceptada">Aceptada</option>
                            <option value="Enviada">Enviada</option>
                            <option value="Borrador">Borrador</option>
                            <option value="Rechazada">Rechazada</option>
                        </select>
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                            <tr>
                                <th className="p-4">COTIZACIÓN</th>
                                <th className="p-4">CLIENTE / EMPRESA</th>
                                <th className="p-4">PRODUCTO O SERVICIO</th>
                                <th className="p-4">FECHA</th>
                                <th className="p-4">TOTAL</th>
                                <th className="p-4">ESTADO</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {quotationList.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50">
                                    <td className="p-4 font-semibold text-slate-800">{item.code}</td>
                                    <td className="p-4">
                                        <div className="font-medium text-slate-900">{item.client}</div>
                                        <div className="text-xs text-slate-400">{item.company}</div>
                                    </td>
                                    <td className="p-4 text-slate-600">{item.product}</td>
                                    <td className="p-4 text-slate-500">{item.date}</td>
                                    <td className="p-4 font-bold text-slate-900">{item.total}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getBadgeStyle(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}