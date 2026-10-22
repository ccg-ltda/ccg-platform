import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BackButton from '@/Components/BackButton';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Trash2, CheckCircle, Users, X, Search, FileText, ArrowLeft, LayoutDashboard, Info, Briefcase } from 'lucide-react';

export default function Index({ 
    companies, 
    totalCompanies = 0, 
    activeCompanies = 0, 
    linkedUsers = 0,
    selectedCompanyId = null,
    quotations = [],
    kpis = {}
}) {
    const { auth } = usePage().props;
    const isSuperAdmin = auth?.user?.is_superadmin ||
        (Array.isArray(auth?.user?.roles) && auth.user.roles.some(r => String(r?.name || r).toLowerCase() === 'superadmin')) ||
        String(auth?.user?.role).toLowerCase() === 'superadmin';

    const [activeTab, setActiveTab] = useState('info');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCompany, setSelectedCompany] = useState(null);

    // Si hay una empresa seleccionada en la URL, la buscamos en la lista
    useEffect(() => {
        if (selectedCompanyId) {
            const company = companies.find(c => c.id == selectedCompanyId);
            if (company) {
                setSelectedCompany(company);
            }
        } else {
            setSelectedCompany(null);
        }
    }, [selectedCompanyId, companies]);

    const filteredCompanies = companies.filter((company) => {
        const term = searchTerm.toLowerCase();
        return (
            company.name?.toLowerCase().includes(term) ||
            company.project?.toLowerCase().includes(term) ||
            company.activity?.toLowerCase().includes(term)
        );
    });

    const handleSelectCompany = (company, tab = 'info') => {
        router.get(route('companies.index'), { company_id: company.id }, {
            preserveState: true,
            onSuccess: () => {
                setSelectedCompany(company);
                setActiveTab(tab);
            }
        });
    };

    const handleBackToList = () => {
        router.get(route('companies.index'));
    };

    const getBadgeStyle = (status) => {
        switch (status) {
            case 'Aceptada': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Enviada': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Borrador': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-rose-100 text-rose-700 border-rose-200';
        }
    };

    // Formulario de creación
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        project: '',
        activity: '',
        status: 'activo',
    });

    const [showModal, setShowModal] = useState(false);
    const [editingCompany, setEditingCompany] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('companies.store'), {
            onSuccess: () => {
                reset();
                setShowModal(false);
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Gestión de Empresas - CCG" />
            <div className="mx-auto max-w-7xl">
                
                {/* Cabecera Condicional */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-bold tracking-[0.25em] text-blue-600 uppercase block mb-1">
                            CCG · {selectedCompany ? 'DETALLE DE SEDE' : 'ADMINISTRACIÓN CENTRAL'}
                        </span>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                            {selectedCompany ? (
                                <span className="flex items-center gap-3">
                                    <span className="text-blue-700">{selectedCompany.name}</span>
                                    <span className="text-slate-400 text-lg font-medium">/ {selectedCompany.project}</span>
                                </span>
                            ) : (
                                <>Gestión de <span className="text-blue-700">Empresas y Organizaciones</span></>
                            )}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        {selectedCompany ? (
                            <button 
                                onClick={handleBackToList}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2.5 rounded-lg transition-all inline-flex items-center gap-2 text-sm border border-slate-200"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Volver al Listado</span>
                            </button>
                        ) : (
                            <>
                                <BackButton href="/dashboard" />
                                {isSuperAdmin && (
                                    <button
                                        onClick={() => setShowModal(true)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg transition-all shadow-sm inline-flex items-center gap-2 text-sm"
                                    >
                                        <Plus className="w-4 h-4 stroke-[3]" />
                                        <span>+ Nueva Empresa</span>
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {!selectedCompany ? (
                    <>
                        {/* KPI Cards (Solo en listado) */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm border-t-4 border-t-blue-500">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                                        <Building2 className="w-5 h-5"/>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Total Empresas</p>
                                        <p className="text-2xl font-black text-slate-900">{totalCompanies}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm border-t-4 border-t-emerald-500">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                                        <CheckCircle className="w-5 h-5"/>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Empresas Activas</p>
                                        <p className="text-2xl font-black text-slate-900">{activeCompanies}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm border-t-4 border-t-violet-500">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600">
                                        <Users className="w-5 h-5"/>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Usuarios Vinculados</p>
                                        <p className="text-2xl font-black text-slate-900">{linkedUsers}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="mb-6 max-w-md">
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                                    <Search className="w-4 h-4" />
                                </span>
                                <input
                                    type="text"
                                    placeholder="Buscar por organización, proyecto o actividad..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 text-gray-900 placeholder-gray-400 text-sm rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
                                />
                            </div>
                        </div>

                        {/* List Table */}
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-700">
                                    <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                                        <tr>
                                            <th className="py-3 px-6 text-xs">Organización</th>
                                            <th className="py-3 px-6 text-xs">Proyecto</th>
                                            <th className="py-3 px-6 text-center text-xs">Estado</th>
                                            <th className="py-3 px-6 text-right min-w-[220px] text-xs">Gestión</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredCompanies.map((company) => (
                                            <tr key={company.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="py-3 px-6 font-bold text-slate-900 flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 cursor-pointer" onClick={() => handleSelectCompany(company)}>
                                                        <Building2 className="w-4 h-4" />
                                                    </div>
                                                    <span className="cursor-pointer hover:text-blue-700" onClick={() => handleSelectCompany(company)}>{company.name}</span>
                                                </td>
                                                <td className="py-3 px-6 text-slate-700 font-medium">
                                                    {company.project}
                                                </td>
                                                <td className="py-3 px-6 text-center">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                        company.status === 'activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                                    }`}>
                                                        {company.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleSelectCompany(company, 'quotations')}
                                                            className="bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-700 text-xs font-bold py-1.5 px-3 rounded-lg transition-all inline-flex items-center gap-1 shadow-sm"
                                                        >
                                                            <FileText className="w-3.5 h-3.5" />
                                                            <span>Cotizaciones</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleSelectCompany(company, 'info')}
                                                            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold py-1.5 px-3 rounded-lg transition-all inline-flex items-center gap-1"
                                                        >
                                                            <Info className="w-3.5 h-3.5" />
                                                            <span>Ver</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Vista de Detalle con Pestañas */
                    <div className="space-y-6">
                        {/* Tab Switcher */}
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit border border-slate-200">
                            <button
                                onClick={() => setActiveTab('info')}
                                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                                    activeTab === 'info' 
                                    ? 'bg-white text-blue-700 shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <Building2 className="w-4 h-4" />
                                Información General
                            </button>
                            <button
                                onClick={() => setActiveTab('quotations')}
                                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                                    activeTab === 'quotations' 
                                    ? 'bg-white text-violet-700 shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <FileText className="w-4 h-4" />
                                Cotizaciones
                            </button>
                        </div>

                        {activeTab === 'info' ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="md:col-span-2 space-y-6">
                                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                                        <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                                            <Info className="w-5 h-5 text-blue-600" />
                                            Datos de la Organización
                                        </h3>
                                        <div className="grid grid-cols-2 gap-y-6 gap-x-4 border-t border-slate-50 pt-6">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Nombre Comercial</p>
                                                <p className="font-bold text-slate-900">{selectedCompany.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Proyecto / Sede</p>
                                                <p className="font-bold text-slate-900">{selectedCompany.project}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Actividad / Rubro</p>
                                                <p className="text-slate-700">{selectedCompany.activity || 'Sin descripción detallada.'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                                        <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Estado Operativo</h3>
                                        <div className={`p-4 rounded-xl border flex items-center justify-between ${
                                            selectedCompany.status === 'activo' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'
                                        }`}>
                                            <span className="font-black uppercase text-xs">{selectedCompany.status}</span>
                                            {selectedCompany.status === 'activo' ? <CheckCircle className="w-5 h-5" /> : <X className="w-5 h-5" />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Pestaña de Cotizaciones */
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {/* KPIs de Cotizaciones para esta sede */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-blue-500">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Abiertas</p>
                                        <p className="text-2xl font-black text-slate-900 mt-1">{kpis.open_count}</p>
                                    </div>
                                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-amber-500">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Valor Abierto</p>
                                        <p className="text-xl font-black text-slate-900 mt-1">{kpis.open_value}</p>
                                    </div>
                                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Aceptadas</p>
                                        <p className="text-2xl font-black text-slate-900 mt-1">{kpis.accepted_count}</p>
                                    </div>
                                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-violet-500">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Conversión</p>
                                        <p className="text-2xl font-black text-slate-900 mt-1">{kpis.conversion_rate}</p>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Listado de Cotizaciones</h4>
                                        <button className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black px-4 py-2 rounded-lg uppercase tracking-tighter transition-all flex items-center gap-2">
                                            <Plus className="w-3.5 h-3.5" />
                                            Nueva Cotización
                                        </button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-[10px] uppercase">
                                                <tr>
                                                    <th className="p-4">Código</th>
                                                    <th className="p-4">Cliente</th>
                                                    <th className="p-4">Negocio Origen</th>
                                                    <th className="p-4 text-center">Fecha</th>
                                                    <th className="p-4 text-right">Total</th>
                                                    <th className="p-4 text-center">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {quotations.length > 0 ? (
                                                    quotations.map((item) => (
                                                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                                            <td className="p-4 font-black text-blue-700">{item.code}</td>
                                                            <td className="p-4 font-medium text-slate-900">{item.client}</td>
                                                            <td className="p-4">
                                                                {item.deal_title ? (
                                                                    <span className="inline-flex items-center gap-1.5 bg-violet-50 text-violet-700 border border-violet-200 rounded-lg px-2.5 py-1 text-[10px] font-bold">
                                                                        <Briefcase className="w-3 h-3" />
                                                                        {item.deal_title}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-slate-300 text-xs italic">Sin negocio</span>
                                                                )}
                                                            </td>
                                                            <td className="p-4 text-slate-500 text-center">{item.date}</td>
                                                            <td className="p-4 font-black text-slate-900 text-right">{item.total_formatted}</td>
                                                            <td className="p-4 text-center">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-black border inline-block min-w-[85px] ${getBadgeStyle(item.status)}`}>
                                                                        {item.status}
                                                                    </span>
                                                                    <select
                                                                        className="text-[10px] border border-slate-200 rounded-lg bg-white text-slate-600 font-bold p-1 focus:outline-none cursor-pointer"
                                                                        value={item.status}
                                                                        onChange={(e) => {
                                                                            router.patch(route('quotations.update-status', item.id), { status: e.target.value }, { preserveScroll: true });
                                                                        }}
                                                                    >
                                                                        <option value="Borrador">Borrador</option>
                                                                        <option value="Enviada">Enviada</option>
                                                                        <option value="Aceptada">Aceptada</option>
                                                                        <option value="Rechazada">Rechazada</option>
                                                                    </select>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="5" className="p-12 text-center text-slate-400 italic font-medium">
                                                            No se registran cotizaciones para esta sede.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Create Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-md w-full shadow-2xl text-gray-900">
                            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
                                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 uppercase tracking-tighter">
                                    <Building2 className="w-5 h-5 text-blue-600" />
                                    Nueva Empresa
                                </h3>
                                <button onClick={() => setShowModal(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><X className="w-5 h-5" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Nombre de la Organización</label>
                                    <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-gray-900 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej. CCG Americas" required />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Proyecto / Sede</label>
                                    <input type="text" value={data.project} onChange={(e) => setData('project', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-gray-900 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej. Sede Sur" required />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Actividad</label>
                                    <textarea value={data.activity} onChange={(e) => setData('activity', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-gray-900 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows="3" placeholder="Descripción..."></textarea>
                                </div>
                                <div className="flex justify-end gap-3 pt-3">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 transition-all">Cancelar</button>
                                    <button type="submit" disabled={processing} className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-200 disabled:opacity-50 transition-all hover:bg-blue-700">{processing ? 'Guardando...' : 'Crear Empresa'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
