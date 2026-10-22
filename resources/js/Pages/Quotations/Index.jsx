import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Search, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function QuotationsIndex({ auth, quotations = [], kpis = {} }) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Valores KPI dinámicos
    const openCount = kpis?.open_count ?? 0;
    const openValue = kpis?.open_value ?? '$0 COP';
    const acceptedCount = kpis?.accepted_count ?? 0;
    const conversionRate = kpis?.conversion_rate ?? '0%';

    // Filtrado funcional de la lista de cotizaciones
    const filteredQuotations = quotations.filter(item => {
        const matchesSearch = 
            item.code.toLowerCase().includes(search.toLowerCase()) ||
            item.client.toLowerCase().includes(search.toLowerCase()) ||
            item.company.toLowerCase().includes(search.toLowerCase());
        
        const matchesStatus = statusFilter === '' || item.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

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
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                                <tr>
                                    <th className="p-4 text-xs">COTIZACIÓN</th>
                                    <th className="p-4 text-xs">CLIENTE / EMPRESA</th>
                                    <th className="p-4 text-xs">PRODUCTO O SERVICIO</th>
                                    <th className="p-4 text-xs text-center">FECHA</th>
                                    <th className="p-4 text-xs text-right">TOTAL</th>
                                    <th className="p-4 text-xs text-center">ESTADO</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredQuotations.length > 0 ? (
                                    filteredQuotations.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4 font-semibold text-slate-800">{item.code}</td>
                                            <td className="p-4">
                                                <div className="font-medium text-slate-900">{item.client}</div>
                                                <div className="text-xs text-slate-400">{item.company}</div>
                                            </td>
                                            <td className="p-4 text-slate-600 max-w-xs truncate">{item.product}</td>
                                            <td className="p-4 text-slate-500 text-center whitespace-nowrap">{item.date}</td>
                                            <td className="p-4 font-bold text-slate-900 text-right">{item.total_formatted}</td>
                                            <td className="p-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold border inline-block min-w-[85px] ${getBadgeStyle(item.status)}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-slate-400 italic">
                                            No se encontraron cotizaciones con los criterios seleccionados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}