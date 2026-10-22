import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Calendar,
    Plus,
    Search,
    MapPin,
    Clock,
    X,
    Trash2,
    CheckCircle,
    Ban,
    Video,
    Copy,
    Check,
    User as UserIcon,
    LayoutGrid,
    Table as TableIcon,
} from 'lucide-react';

export default function ReservationsIndex({
    reservations = [],
    companies = [],
    users = [],
    isSuperAdmin = false,
    userCompanyId = null,
}) {
    const { auth } = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [viewMode, setViewMode] = useState('table');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [copiedId, setCopiedId] = useState(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        client_name: '',
        service: '',
        estimated_amount: '',
        company_id: isSuperAdmin ? '' : userCompanyId,
        appointment_datetime: '',
        location: '',
        modality: 'Presencial',
        meeting_link: '',
        contact_phone: '',
        contact_email: '',
        start_time: '',
        end_time: '',
        assigned_to: auth?.user?.id ?? '',
        notes: '',
    });

    const filteredReservations = reservations.filter((r) => {
        const term = searchTerm.toLowerCase();
        const matchSearch =
            r.client_name.toLowerCase().includes(term) ||
            r.service.toLowerCase().includes(term) ||
            (r.contact_email || '').toLowerCase().includes(term) ||
            (r.assigned_to_name || '').toLowerCase().includes(term);
        const matchDateFrom = !dateFrom || r.appointment_datetime >= dateFrom;
        const matchDateTo = !dateTo || r.appointment_datetime <= dateTo + ' 23:59';
        const matchStatus = !statusFilter || r.status === statusFilter;
        return matchSearch && matchDateFrom && matchDateTo && matchStatus;
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('reservations.store'), {
            onSuccess: () => {
                setShowModal(false);
                reset();
            },
        });
    };

    const handleStatusChange = (id, newStatus) => {
        router.patch(route('reservations.update-status', id), { status: newStatus });
    };

    const handleDelete = (id) => {
        if (confirm('¿Eliminar esta reserva?')) {
            router.delete(route('reservations.destroy', id));
        }
    };

    const copyLink = (id, link) => {
        if (navigator.clipboard) navigator.clipboard.writeText(link).catch(() => {});
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Confirmada': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Cancelada': return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'Completada': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-amber-100 text-amber-700 border-amber-200';
        }
    };

    const getDurationLabel = (start, end) => {
        if (!start || !end) return null;
        const [sh, sm] = start.split(':').map(Number);
        const [eh, em] = end.split(':').map(Number);
        const diff = eh * 60 + em - (sh * 60 + sm);
        if (diff <= 0) return null;
        const h = Math.floor(diff / 60);
        const m = diff % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    const isVirtual = (r) => r.modality === 'Virtual';

    const getModality = (r) => (isVirtual(r)
        ? { className: 'bg-cyan-100 text-cyan-700 border-cyan-200', Icon: Video, label: 'Virtual' }
        : { className: 'bg-indigo-100 text-indigo-700 border-indigo-200', Icon: MapPin, label: 'Presencial' });

    const renderLocation = (r) => {
        const modality = getModality(r);
        const duration = getDurationLabel(r.start_time, r.end_time);

        return (
            <div>
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${modality.className}`}>
                        <modality.Icon className="w-3 h-3" />
                        {modality.label}
                    </span>
                    {duration && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border bg-amber-100 text-amber-700 border-amber-200">
                            <Clock className="w-3 h-3" />
                            {r.start_time} - {r.end_time} ({duration})
                        </span>
                    )}
                </div>

                {isVirtual(r) && r.meeting_link ? (
                    <div className="flex items-center gap-2">
                        <a
                            href={r.meeting_link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                        >
                            <Video className="w-3.5 h-3.5" />
                            Unirse a la videollamada
                        </a>
                        <button
                            onClick={() => copyLink(r.id, r.meeting_link)}
                            className="p-1 hover:bg-blue-50 rounded text-blue-600 transition"
                            title="Copiar enlace"
                        >
                            {copiedId === r.id
                                ? <Check className="w-3.5 h-3.5 text-emerald-600" />
                                : <Copy className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 text-slate-500">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="text-xs">{r.location}</span>
                    </div>
                )}

                {r.notes && <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{r.notes}</p>}
            </div>
        );
    };

    const renderActions = (r) => (
        <div className="flex items-center justify-end gap-1">
            <button
                onClick={() => handleStatusChange(r.id, 'Confirmada')}
                className="p-1.5 hover:bg-emerald-50 rounded-lg transition-all text-emerald-600"
                title="Confirmar"
            >
                <CheckCircle className="w-4 h-4" />
            </button>
            <button
                onClick={() => handleStatusChange(r.id, 'Cancelada')}
                className="p-1.5 hover:bg-rose-50 rounded-lg transition-all text-rose-600"
                title="Cancelar"
            >
                <Ban className="w-4 h-4" />
            </button>
            <button
                onClick={() => handleDelete(r.id)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-all text-slate-400"
                title="Eliminar"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );

    const kanbanColumns = ['Pendiente', 'Confirmada', 'Completada', 'Cancelada'];

    const renderKanbanCard = (r) => {
        const modality = getModality(r);
        const duration = getDurationLabel(r.start_time, r.end_time);

        return (
            <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <p className="font-bold text-slate-900">{r.client_name}</p>
                        <p className="text-xs text-slate-500">{r.service}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-black border ${getStatusBadge(r.status)}`}>
                        {r.status}
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${modality.className}`}>
                        <modality.Icon className="w-3 h-3" />
                        {modality.label}
                    </span>
                    {duration && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border bg-amber-100 text-amber-700 border-amber-200">
                            <Clock className="w-3 h-3" />
                            {r.start_time} - {r.end_time} ({duration})
                        </span>
                    )}
                </div>

                {renderLocation(r)}

                <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <UserIcon className="w-3.5 h-3.5 text-blue-500" />
                    <span className="font-semibold">{r.assigned_to_name || 'Sin asignar'}</span>
                </div>

                {renderActions(r)}
            </div>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Reservas" />

            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-black tracking-[0.2em] text-blue-600 uppercase">Citas · Calendario</span>
                        <h1 className="text-2xl font-black text-slate-900">Gestión de <span className="text-blue-700">Reservas</span></h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                            <button
                                onClick={() => setViewMode('table')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                            >
                                <TableIcon className="w-3.5 h-3.5" />
                                Tabla
                            </button>
                            <button
                                onClick={() => setViewMode('kanban')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${viewMode === 'kanban' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                            >
                                <LayoutGrid className="w-3.5 h-3.5" />
                                Kanban
                            </button>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center gap-2 text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            <span>+ Nueva Reserva</span>
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar cliente, servicio, contacto o asignado..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <input
                        type="date"
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                    />
                    <input
                        type="date"
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                    />
                    <select
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">Todos los estados</option>
                        <option value="Pendiente">Pendiente</option>
                        <option value="Confirmada">Confirmada</option>
                        <option value="Cancelada">Cancelada</option>
                        <option value="Completada">Completada</option>
                    </select>
                </div>

                {viewMode === 'table' ? (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-[10px] uppercase">
                                    <tr>
                                        <th className="p-4">Cliente</th>
                                        <th className="p-4">Servicio</th>
                                        <th className="p-4">Sede</th>
                                        <th className="p-4">Fecha y Hora</th>
                                        <th className="p-4">Ubicación</th>
                                        <th className="p-4">Asignado a</th>
                                        <th className="p-4">Estado</th>
                                        <th className="p-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredReservations.length > 0 ? (
                                        filteredReservations.map((r) => (
                                            <tr key={r.id} className="hover:bg-slate-50 transition-colors align-top">
                                                <td className="p-4">
                                                    <p className="font-bold text-slate-900">{r.client_name}</p>
                                                    <p className="text-xs text-slate-500">{r.contact_email || 'Sin correo'}</p>
                                                    <p className="text-xs text-slate-400">{r.contact_phone || 'Sin teléfono'}</p>
                                                </td>
                                                <td className="p-4 text-slate-600">{r.service}</td>
                                                <td className="p-4 text-slate-500">{r.company}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1.5 text-slate-700">
                                                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                                        <span className="font-medium">{r.appointment_datetime}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 max-w-[280px]">{renderLocation(r)}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1.5 text-slate-600">
                                                        <UserIcon className="w-3.5 h-3.5 text-blue-500" />
                                                        <span className="text-xs font-semibold">{r.assigned_to_name || 'Sin asignar'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-black border ${getStatusBadge(r.status)}`}>
                                                        {r.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">{renderActions(r)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={8} className="p-12 text-center text-slate-400 italic">
                                                No se encontraron reservas.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {kanbanColumns.map((status) => {
                            const columnItems = filteredReservations.filter((r) => r.status === status);
                            return (
                                <div key={status} className="bg-slate-100 rounded-xl p-3">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-600">{status}</h3>
                                        <span className="text-xs font-bold text-slate-500">{columnItems.length}</span>
                                    </div>
                                    <div className="space-y-3">
                                        {columnItems.length > 0 ? (
                                            columnItems.map((r) => renderKanbanCard(r))
                                        ) : (
                                            <p className="text-xs text-slate-400 italic text-center py-6">Sin reservas</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-blue-50/50">
                            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                Nueva Reserva
                            </h3>
                            <button onClick={() => { setShowModal(false); reset(); }} className="p-2 hover:bg-slate-200 rounded-xl transition-all"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Nombre del Cliente / Empresa</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ej. María López - Retail Commerce"
                                    value={data.client_name}
                                    onChange={e => setData('client_name', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Servicio / Producto de Interés</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ej. Suscripción empresarial"
                                    value={data.service}
                                    onChange={e => setData('service', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Sede / Organización</label>
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
                                            {companies[0]?.name || 'Mi Sede'}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Monto Estimado (opcional)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                                        placeholder="0.00"
                                        value={data.estimated_amount}
                                        onChange={e => setData('estimated_amount', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Modalidad de la Cita</label>
                                    <select
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={data.modality}
                                        onChange={e => setData('modality', e.target.value)}
                                        required
                                    >
                                        <option value="Presencial">Presencial</option>
                                        <option value="Virtual">Virtual (Videollamada)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Asignado a (Atendido por)</label>
                                    <select
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={data.assigned_to}
                                        onChange={e => setData('assigned_to', e.target.value)}
                                    >
                                        <option value="">Sin asignar</option>
                                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Teléfono de Contacto</label>
                                    <input
                                        type="tel"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ej. 300 123 4567"
                                        value={data.contact_phone}
                                        onChange={e => setData('contact_phone', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Correo de Contacto</label>
                                    <input
                                        type="email"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="cliente@correo.com"
                                        value={data.contact_email}
                                        onChange={e => setData('contact_email', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Fecha y Hora de la Cita</label>
                                <input
                                    type="datetime-local"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={data.appointment_datetime}
                                    onChange={e => setData('appointment_datetime', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Hora de Inicio</label>
                                    <input
                                        type="time"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={data.start_time}
                                        onChange={e => setData('start_time', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Hora Fin</label>
                                    <input
                                        type="time"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={data.end_time}
                                        onChange={e => setData('end_time', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Lugar / Dirección de la Sede</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ej. Calle 123 #45-67, Oficina 301"
                                    value={data.location}
                                    onChange={e => setData('location', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                                    Enlace de Videollamada {data.modality !== 'Virtual' && <span className="text-slate-400 normal-case font-semibold">(opcional)</span>}
                                </label>
                                <input
                                    type="url"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://meet.google.com/abc-defg-hij"
                                    value={data.meeting_link}
                                    onChange={e => setData('meeting_link', e.target.value)}
                                    required={data.modality === 'Virtual'}
                                />
                                {errors.meeting_link && <p className="text-xs text-rose-600 mt-1">{errors.meeting_link}</p>}
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Notas / Observaciones</label>
                                <textarea
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    rows={3}
                                    placeholder="Detalles o indicaciones antes de la cita..."
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); reset(); }}
                                    className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-200 disabled:opacity-50 transition-all hover:bg-blue-700"
                                >
                                    {processing ? 'Guardando...' : 'Crear Reserva'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
