import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BookingCalendar from '@/Components/BookingCalendar';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Briefcase, Plus, Search, MoreHorizontal, Calendar, DollarSign, Building2, User, X, Pencil, FileText, Clock, MapPin, LayoutGrid, CalendarDays } from 'lucide-react';

const STAGES_ORDER = [
    'Cita Programada',
    'Calificado para Comprar',
    'Presentación Programada',
    'Propuesta / Cotización',
    'Contrato Enviado',
    'Cierre Ganado',
];

export default function DealsIndex({ deals = [], bookings = [], stages = [], companies = [], users = [], isSuperAdmin = false, userCompanyId = null, quotations = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [viewMode, setViewMode] = useState('board');
    const [editingDeal, setEditingDeal] = useState(null);
    const [viewingQuotation, setViewingQuotation] = useState(null);
    const [quotationObservation, setQuotationObservation] = useState('');
    const [pendingAction, setPendingAction] = useState(null);
    const [schedulingAppointment, setSchedulingAppointment] = useState(false);
    const [stageError, setStageError] = useState('');

    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        company_id: '',
        amount: '',
        stage: stages[0] || 'Cita Programada',
        expected_close_date: '',
        notes: '',
    });

    const {
        data: editData,
        setData: setEditData,
        put: editPut,
        processing: editProcessing,
        errors: editErrors,
        reset: resetEdit,
    } = useForm({
        title: '',
        company_id: '',
        user_id: '',
        amount: '',
        stage: '',
        expected_close_date: '',
        notes: '',
    });

    const getBadgeStyle = (status) => {
        switch (status) {
            case 'Aceptada': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Enviada': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Borrador': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-rose-100 text-rose-700 border-rose-200';
        }
    };

    const filteredDeals = deals.filter(deal => 
        deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getDealsByStage = (stage) => filteredDeals.filter(deal => deal.stage === stage);

    const handleStageChange = (dealId, newStage) => {
        const deal = deals.find(d => d.id === dealId);
        if (!deal) return;

        if (newStage === 'Cierre Perdido') {
            router.patch(route('deals.update', dealId), { stage: newStage });
            return;
        }

        const currentIndex = STAGES_ORDER.indexOf(deal.stage);
        const newIndex = STAGES_ORDER.indexOf(newStage);

        if (newIndex > currentIndex + 1) {
            setStageError(`Debes completar la etapa anterior antes de avanzar a ${newStage}`);
            setTimeout(() => setStageError(''), 4000);
            return;
        }

        setStageError('');
        router.patch(route('deals.update', dealId), { stage: newStage });
    };

    const { data: apptData, setData: setApptData, post: apptPost, processing: apptProcessing, reset: apptReset } = useForm({
        appointment_date: '',
        appointment_time: '',
        appointment_location: '',
        appointment_notes: '',
    });

    const openScheduleAppointment = (deal) => {
        setEditingDeal(deal);
        setApptData({
            appointment_date: deal.appointment_date || '',
            appointment_time: deal.appointment_time || '',
            appointment_location: deal.appointment_location || '',
            appointment_notes: deal.appointment_notes || '',
        });
        setSchedulingAppointment(true);
    };

    const handleScheduleSubmit = (e) => {
        e.preventDefault();
        apptPost(route('deals.schedule-appointment', editingDeal.id), {
            onSuccess: () => {
                setSchedulingAppointment(false);
                apptReset();
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('deals.store'), {
            onSuccess: () => {
                setShowModal(false);
                reset();
            }
        });
    };

    const openEdit = (deal) => {
        setEditingDeal(deal);
        setEditData({
            title: deal.title,
            company_id: companies.find(c => c.name === deal.company)?.id || '',
            user_id: users.find(u => u.name === deal.user)?.id || '',
            amount: deal.amount,
            stage: deal.stage,
            expected_close_date: deal.expected_close_date,
            notes: deal.notes || '',
        });
    };

    const handleOpenDealFromAgenda = (dealId) => {
        const deal = deals.find(d => Number(d.id) === Number(dealId));
        if (deal) {
            setViewMode('board');
            openEdit(deal);
        }
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        editPut(route('deals.update', editingDeal.id), {
            onSuccess: () => {
                setEditingDeal(null);
                resetEdit();
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Pipeline de Negocios" />
            
            <div className="mx-auto max-w-[1600px] h-full flex flex-col space-y-6">
                {/* Cabecera */}
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-black tracking-[0.2em] text-blue-600 uppercase">Ventas · Pipeline</span>
                        <h1 className="text-2xl font-black text-slate-900">Gestión de <span className="text-blue-700">Negocios</span></h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Buscar negocio o empresa..."
                                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={() => setShowModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center gap-2 text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Nuevo Negocio</span>
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit border border-slate-200">
                    <button
                        type="button"
                        onClick={() => setViewMode('board')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition ${viewMode === 'board' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                        Tablero Kanban
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('agenda')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition ${viewMode === 'agenda' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <CalendarDays className="w-4 h-4" />
                        Agenda / Calendario
                    </button>
                </div>

                {viewMode === 'agenda' ? (
                    <BookingCalendar
                        bookings={bookings}
                        deals={deals}
                        onOpenDeal={handleOpenDealFromAgenda}
                    />
                ) : (
                <div className="flex gap-4 overflow-x-auto pb-6 min-h-[70vh]">
                    {stages.map((stage) => (
                        <div key={stage} className="min-w-[280px] w-[280px] flex flex-col space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                    {stage}
                                </h3>
                                <span className="bg-slate-200 text-slate-600 text-[10px] font-black px-2 py-0.5 rounded-full">
                                    {getDealsByStage(stage).length}
                                </span>
                            </div>

                            <div className="flex-1 bg-slate-100/50 rounded-2xl p-3 space-y-3 border border-dashed border-slate-200">
                                {getDealsByStage(stage).map((deal) => (
                                    <div 
                                        key={deal.id}
                                        className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-blue-400 transition-all group cursor-pointer"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{deal.title}</h4>
                                            <button
                                                onClick={() => openEdit(deal)}
                                                className="text-slate-400 hover:text-blue-600 transition-colors"
                                                title="Editar negocio"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                        </div>
                                        
                                        {deal.is_accepted && (
                                            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">Aceptado</span>
                                            </div>
                                        )}

                                        {deal.stage === 'Cita Programada' && (
                                            <div className="pt-2 border-t border-slate-50">
                                                {deal.appointment_date ? (
                                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 space-y-1">
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar className="w-3.5 h-3.5 text-blue-600" />
                                                            <span className="text-[10px] font-black text-blue-700 uppercase tracking-wider">Cita Agendada</span>
                                                        </div>
                                                        <p className="text-[11px] font-bold text-blue-900">{deal.appointment_date} - {deal.appointment_time}</p>
                                                        {deal.appointment_location && (
                                                            <div className="flex items-center gap-1 text-[10px] text-blue-600">
                                                                <MapPin className="w-3 h-3" />
                                                                <span>{deal.appointment_location}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); openScheduleAppointment(deal); }}
                                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2.5 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 font-bold"
                                                    >
                                                        <Calendar className="w-4 h-4" />
                                                        <span className="text-xs font-black uppercase tracking-wider">Programar Cita</span>
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                                <Building2 className="w-3.5 h-3.5" />
                                                <span className="font-semibold">{deal.company}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold">
                                                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                                                <span className="text-slate-900">{deal.amount_formatted}</span>
                                            </div>
                                            <div className="pt-2 border-t border-slate-50 flex items-center justify-between mt-2">
                                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                                    <Calendar className="w-3 h-3" />
                                                    {deal.expected_close_date}
                                                </div>
                                                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                                                    <User className="w-3 h-3" />
                                                </div>
                                            </div>
                                            {deal.has_quotation && (
                                                <div className="pt-2 border-t border-slate-50">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const q = quotations.find(qt => qt.code === deal.quotation_code);
                                                            setViewingQuotation(q || { code: deal.quotation_code, status: deal.quotation_status });
                                                        }}
                                                        className="w-full text-left bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-lg px-2 py-1.5 transition-all flex items-center justify-between group/cot"
                                                    >
                                                        <span className="text-[10px] font-black text-violet-700 uppercase tracking-wider">
                                                            {deal.quotation_code || 'Ver Cotización'}
                                                        </span>
                                                        <FileText className="w-3 h-3 text-violet-400 group-hover/cot:text-violet-600 transition-colors" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Acciones Rápidas (Simple Select para cambiar etapa) */}
                                        <select 
                                            className="mt-3 w-full text-[10px] border-slate-100 rounded-lg bg-slate-50 text-slate-500 font-bold p-1 focus:outline-none"
                                            value={deal.stage}
                                            onChange={(e) => handleStageChange(deal.id, e.target.value)}
                                        >
                                            {stages.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                ))}
                                
                                {getDealsByStage(stage).length === 0 && (
                                    <div className="h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs italic">
                                        Sin negocios
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                )}

                {/* Modal Crear Negocio */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-blue-600" />
                                    Nuevo Negocio
                                </h3>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-all"><X className="w-5 h-5" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Título del Negocio</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ej. Implementación CRM - Fase 1"
                                        value={data.title}
                                        onChange={e => setData('title', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Empresa</label>
                                        {isSuperAdmin ? (
                                            <select
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={data.company_id}
                                                onChange={e => setData('company_id', e.target.value)}
                                                required
                                            >
                                                <option value="">Seleccionar...</option>
                                                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        ) : (
                                            <div className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700">
                                                {companies[0]?.name || 'Mi Empresa'}
                                                <input type="hidden" value={data.company_id || userCompanyId} onChange={() => {}} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Valor (COP)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                                            placeholder="0.00"
                                            value={data.amount}
                                            onChange={e => setData('amount', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Etapa Inicial</label>
                                        <select 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                                            value={data.stage}
                                            onChange={e => setData('stage', e.target.value)}
                                        >
                                            {stages.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Cierre Estimado</label>
                                        <input 
                                            type="date" 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={data.expected_close_date}
                                            onChange={e => setData('expected_close_date', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                    <button 
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={processing}
                                        className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-200 disabled:opacity-50 transition-all hover:bg-blue-700"
                                    >
                                        {processing ? 'Guardando...' : 'Crear Negocio'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Editar Negocio */}
                {editingDeal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                    <Pencil className="w-5 h-5 text-blue-600" />
                                    Editar Negocio
                                </h3>
                                <button onClick={() => setEditingDeal(null)} className="p-2 hover:bg-slate-200 rounded-xl transition-all"><X className="w-5 h-5" /></button>
                            </div>
                            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Título</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={editData.title}
                                        onChange={e => setEditData('title', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Empresa</label>
                                        {isSuperAdmin ? (
                                            <select
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={editData.company_id}
                                                onChange={e => setEditData('company_id', e.target.value)}
                                                required
                                            >
                                                <option value="">Seleccionar...</option>
                                                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        ) : (
                                            <div className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700">
                                                {companies.find(c => c.id == editData.company_id)?.name || 'Mi Empresa'}
                                                <input type="hidden" value={editData.company_id} onChange={() => {}} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Valor (COP)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                                            value={editData.amount}
                                            onChange={e => setEditData('amount', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Etapa</label>
                                        <select
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                                            value={editData.stage}
                                            onChange={e => setEditData('stage', e.target.value)}
                                        >
                                            {stages.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Cierre Estimado</label>
                                        <input
                                            type="date"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={editData.expected_close_date}
                                            onChange={e => setEditData('expected_close_date', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Notas</label>
                                    <textarea
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                        rows={3}
                                        value={editData.notes}
                                        onChange={e => setEditData('notes', e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setEditingDeal(null)}
                                        className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={editProcessing}
                                        className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-200 disabled:opacity-50 transition-all hover:bg-blue-700"
                                    >
                                        {editProcessing ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {viewingQuotation && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-violet-50/50">
                                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-violet-600" />
                                    Cotización {viewingQuotation.code}
                                </h3>
                                <button onClick={() => { setViewingQuotation(null); setPendingAction(null); setQuotationObservation(''); }} className="p-2 hover:bg-slate-200 rounded-xl transition-all"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Estado</label>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] uppercase font-black border ${getBadgeStyle(viewingQuotation.status)}`}>
                                            {viewingQuotation.status || 'Borrador'}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Fecha</label>
                                        <p className="font-bold text-slate-900 text-sm">{viewingQuotation.date || '-'}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Producto / Servicio</label>
                                    <p className="text-slate-700 text-sm">{viewingQuotation.product || editingDeal?.title || '-'}</p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total</label>
                                    <p className="text-xl font-black text-slate-900">{viewingQuotation.total_formatted || editingDeal?.amount_formatted || '-'}</p>
                                </div>

                                {(viewingQuotation.status === 'Aceptada' || viewingQuotation.status === 'Rechazada') && (
                                    <div className={`p-4 rounded-xl border ${viewingQuotation.status === 'Aceptada' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                                        <div className="flex items-center gap-2">
                                            {viewingQuotation.status === 'Aceptada' ? (
                                                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                                            ) : (
                                                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                                            )}
                                            <span className={`text-xs font-black uppercase tracking-wider ${viewingQuotation.status === 'Aceptada' ? 'text-emerald-700' : 'text-rose-700'}`}>
                                                {viewingQuotation.status === 'Aceptada' ? 'Cotización Aceptada' : 'Cotización Rechazada'}
                                            </span>
                                        </div>
                                        {viewingQuotation.observation && (
                                            <p className="mt-2 text-xs text-slate-600 italic">{viewingQuotation.observation}</p>
                                        )}
                                    </div>
                                )}

                                {viewingQuotation.id && viewingQuotation.status !== 'Aceptada' && viewingQuotation.status !== 'Rechazada' && !pendingAction && (
                                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                                        <button
                                            onClick={() => setPendingAction('Aceptada')}
                                            className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all"
                                        >
                                            Aceptar Cotización
                                        </button>
                                        <button
                                            onClick={() => setPendingAction('Rechazada')}
                                            className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-all"
                                        >
                                            Rechazar
                                        </button>
                                    </div>
                                )}

                                {pendingAction && (
                                    <div className="pt-4 border-t border-slate-100 space-y-3">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                                                Observaciones / Motivo de la decisión
                                            </label>
                                            <textarea
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                                rows={3}
                                                placeholder="Ingrese una nota o motivo (opcional)..."
                                                value={quotationObservation}
                                                onChange={e => setQuotationObservation(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => { setPendingAction(null); setQuotationObservation(''); }}
                                                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all"
                                            >
                                                Volver
                                            </button>
                                            <button
                                                onClick={() => {
                                                    router.patch(route('quotations.update-status', viewingQuotation.id), {
                                                        status: pendingAction,
                                                        observation: quotationObservation
                                                    }, {
                                                        onSuccess: () => {
                                                            setViewingQuotation(prev => ({ ...prev, status: pendingAction, observation: quotationObservation }));
                                                            setPendingAction(null);
                                                            setQuotationObservation('');
                                                        }
                                                    });
                                                }}
                                                className={`flex-1 px-4 py-2.5 text-white font-bold rounded-xl text-xs transition-all ${pendingAction === 'Aceptada' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
                                            >
                                                {pendingAction === 'Aceptada' ? 'Confirmar Aceptación' : 'Confirmar Rechazo'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {schedulingAppointment && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-blue-50/50">
                                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                    Programar Cita
                                </h3>
                                <button onClick={() => { setSchedulingAppointment(false); apptReset(); }} className="p-2 hover:bg-slate-200 rounded-xl transition-all"><X className="w-5 h-5" /></button>
                            </div>
                            <form onSubmit={handleScheduleSubmit} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Fecha</label>
                                        <input
                                            type="date"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={apptData.appointment_date}
                                            onChange={e => setApptData('appointment_date', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Hora</label>
                                        <input
                                            type="time"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={apptData.appointment_time}
                                            onChange={e => setApptData('appointment_time', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Lugar / Enlace de reunión</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ej. Oficina principal / Zoom: https://..."
                                        value={apptData.appointment_location}
                                        onChange={e => setApptData('appointment_location', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Notas de la cita</label>
                                    <textarea
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                        rows={3}
                                        placeholder="Notas adicionales..."
                                        value={apptData.appointment_notes}
                                        onChange={e => setApptData('appointment_notes', e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => { setSchedulingAppointment(false); apptReset(); }}
                                        className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={apptProcessing}
                                        className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-200 disabled:opacity-50 transition-all hover:bg-blue-700"
                                    >
                                        {apptProcessing ? 'Guardando...' : 'Guardar Cita'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {stageError && (
                    <div className="fixed bottom-6 right-6 z-50 bg-rose-50 border border-rose-200 rounded-xl p-4 shadow-lg max-w-sm">
                        <p className="text-xs font-bold text-rose-700">{stageError}</p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
