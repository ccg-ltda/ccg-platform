import { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, X, CalendarDays, Clock, MapPin, User, Building2, Video, CheckCircle, Ban, ExternalLink } from 'lucide-react';

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const STATUS_STYLES = {
    Confirmada: {
        chip: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200',
        dot: 'bg-emerald-500',
        badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    },
    Pendiente: {
        chip: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200',
        dot: 'bg-amber-500',
        badge: 'bg-amber-100 text-amber-700 border-amber-200',
    },
    Completada: {
        chip: 'bg-sky-100 text-sky-800 border-sky-200 hover:bg-sky-200',
        dot: 'bg-sky-500',
        badge: 'bg-sky-100 text-sky-700 border-sky-200',
    },
    Cancelada: {
        chip: 'bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200 line-through',
        dot: 'bg-rose-500',
        badge: 'bg-rose-100 text-rose-700 border-rose-200',
    },
    Negocio: {
        chip: 'bg-violet-100 text-violet-800 border-violet-200 hover:bg-violet-200',
        dot: 'bg-violet-500',
        badge: 'bg-violet-100 text-violet-700 border-violet-200',
    },
};

const DEFAULT_STYLE = {
    chip: 'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200',
    dot: 'bg-indigo-500',
    badge: 'bg-indigo-100 text-indigo-700 border-indigo-200',
};

const pad = (value) => String(value).padStart(2, '0');
const dayKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const parseDate = (value) => {
    if (!value) return null;
    const parsed = new Date(String(value).replace(' ', 'T'));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};
const getStyle = (status) => STATUS_STYLES[status] || DEFAULT_STYLE;

function EventChip({ event, onSelect, compact = false }) {
    const style = getStyle(event.status);
    return (
        <button
            type="button"
            onClick={() => onSelect(event)}
            className={`w-full text-left rounded-lg border px-2 py-1 transition ${style.chip} ${compact ? 'text-[10px]' : 'text-xs'}`}
        >
            <div className="flex items-center gap-1.5 min-w-0">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
                <span className="font-black shrink-0">{event.time}</span>
                <span className="truncate font-semibold">{event.title}</span>
            </div>
        </button>
    );
}

export default function BookingCalendar({ bookings = [], deals = [], onOpenDeal }) {
    const [view, setView] = useState('month');
    const [cursor, setCursor] = useState(() => new Date());
    const [selected, setSelected] = useState(null);

    const events = useMemo(() => {
        const list = [];
        const linkedDealIds = new Set();

        (bookings || []).forEach((booking) => {
            const start = parseDate(booking.appointment_datetime);
            if (!start) return;
            if (booking.deal_id) linkedDealIds.add(Number(booking.deal_id));

            list.push({
                key: `booking-${booking.id}`,
                type: 'booking',
                id: booking.id,
                title: `${booking.client_name} · ${booking.service}`,
                start,
                date: dayKey(start),
                time: `${pad(start.getHours())}:${pad(start.getMinutes())}`,
                status: booking.status || 'Pendiente',
                client: booking.client_name,
                service: booking.service,
                company: booking.company,
                location: booking.location,
                modality: booking.modality,
                meeting_link: booking.meeting_link,
                contact_phone: booking.contact_phone,
                contact_email: booking.contact_email,
                notes: booking.notes,
                amount: booking.estimated_amount_formatted,
                deal_id: booking.deal_id,
                deal_title: booking.deal_title,
                deal_stage: booking.deal_stage,
            });
        });

        (deals || []).forEach((deal) => {
            if (!deal.appointment_date) return;
            if (linkedDealIds.has(Number(deal.id))) return;

            const start = parseDate(deal.appointment_date);
            if (!start) return;

            const status = deal.stage === 'Cierre Ganado'
                ? 'Completada'
                : deal.stage === 'Cierre Perdido'
                    ? 'Cancelada'
                    : 'Negocio';

            list.push({
                key: `deal-${deal.id}`,
                type: 'deal',
                id: deal.id,
                title: deal.title,
                start,
                date: dayKey(start),
                time: deal.appointment_time || `${pad(start.getHours())}:${pad(start.getMinutes())}`,
                status,
                client: deal.company,
                service: deal.title,
                company: deal.company,
                location: deal.appointment_location,
                modality: null,
                meeting_link: null,
                contact_phone: null,
                contact_email: null,
                notes: deal.appointment_notes,
                amount: deal.amount_formatted,
                deal_id: deal.id,
                deal_title: deal.title,
                deal_stage: deal.stage,
            });
        });

        return list.sort((a, b) => a.start - b.start);
    }, [bookings, deals]);

    const eventsByDay = useMemo(() => {
        return events.reduce((acc, event) => {
            if (!acc[event.date]) acc[event.date] = [];
            acc[event.date].push(event);
            return acc;
        }, {});
    }, [events]);

    const monthCells = useMemo(() => {
        const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
        const offset = (first.getDay() + 6) % 7;
        const start = new Date(first);
        start.setDate(1 - offset);

        return Array.from({ length: 42 }, (_, index) => {
            const day = new Date(start);
            day.setDate(start.getDate() + index);
            return day;
        });
    }, [cursor]);

    const weekDays = useMemo(() => {
        const base = new Date(cursor);
        const offset = (base.getDay() + 6) % 7;
        base.setDate(base.getDate() - offset);

        return Array.from({ length: 7 }, (_, index) => {
            const day = new Date(base);
            day.setDate(base.getDate() + index);
            return day;
        });
    }, [cursor]);

    const title = useMemo(() => {
        if (view === 'month') return `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`;
        if (view === 'week') {
            const start = weekDays[0];
            const end = weekDays[6];
            return `${start.getDate()} ${MONTHS[start.getMonth()].slice(0, 3)} - ${end.getDate()} ${MONTHS[end.getMonth()].slice(0, 3)} ${end.getFullYear()}`;
        }
        return `${cursor.getDate()} de ${MONTHS[cursor.getMonth()]} de ${cursor.getFullYear()}`;
    }, [view, cursor, weekDays]);

    const shift = (direction) => {
        const next = new Date(cursor);
        if (view === 'month') next.setMonth(next.getMonth() + direction);
        else if (view === 'week') next.setDate(next.getDate() + (7 * direction));
        else next.setDate(next.getDate() + direction);
        setCursor(next);
    };

    const handleStatusChange = (status) => {
        if (!selected || selected.type !== 'booking') return;
        router.patch(route('reservations.update-status', selected.id), { status }, {
            preserveScroll: true,
            onSuccess: () => setSelected(null),
        });
    };

    const formatLongDate = (date) => {
        const formatted = date.toLocaleDateString('es-CO', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        });
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    };

    const selectedStyle = selected ? getStyle(selected.status) : DEFAULT_STYLE;

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={() => shift(-1)} className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => setCursor(new Date())} className="px-3 h-9 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-black text-slate-700 transition">
                            Hoy
                        </button>
                        <button type="button" onClick={() => shift(1)} className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <h3 className="ml-2 text-sm font-black text-slate-900">{title}</h3>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                        {[
                            { key: 'month', label: 'Mes' },
                            { key: 'week', label: 'Semana' },
                            { key: 'day', label: 'Día' },
                        ].map((option) => (
                            <button
                                key={option.key}
                                type="button"
                                onClick={() => setView(option.key)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${view === option.key ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-slate-500">
                    {Object.entries(STATUS_STYLES).map(([status, style]) => (
                        <span key={status} className="inline-flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                            {status}
                        </span>
                    ))}
                </div>

                {view === 'month' && (
                    <div className="overflow-x-auto">
                        <div className="min-w-[760px]">
                            <div className="grid grid-cols-7 gap-2 mb-2">
                                {WEEKDAYS.map((day) => (
                                    <div key={day} className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">{day}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-2">
                                {monthCells.map((day) => {
                                    const key = dayKey(day);
                                    const dayEvents = eventsByDay[key] || [];
                                    const isCurrentMonth = day.getMonth() === cursor.getMonth();
                                    const isToday = key === dayKey(new Date());

                                    return (
                                        <div key={key} className={`min-h-[112px] rounded-xl border p-2 ${isCurrentMonth ? 'bg-slate-50/60 border-slate-200' : 'bg-white border-slate-100 opacity-45'}`}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={`text-xs font-black ${isToday ? 'w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center' : 'text-slate-500'}`}>
                                                    {day.getDate()}
                                                </span>
                                                {dayEvents.length > 0 && <span className="text-[9px] font-bold text-slate-400">{dayEvents.length}</span>}
                                            </div>
                                            <div className="space-y-1">
                                                {dayEvents.slice(0, 3).map((event) => (
                                                    <EventChip key={event.key} event={event} onSelect={setSelected} compact />
                                                ))}
                                                {dayEvents.length > 3 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => { setCursor(day); setView('day'); }}
                                                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800"
                                                    >
                                                        +{dayEvents.length - 3} más
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {view === 'week' && (
                    <div className="overflow-x-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-7 gap-2 min-w-[760px]">
                            {weekDays.map((day) => {
                                const key = dayKey(day);
                                const dayEvents = eventsByDay[key] || [];
                                const isToday = key === dayKey(new Date());

                                return (
                                    <div key={key} className="rounded-xl border border-slate-200 bg-slate-50/60 p-2 min-h-[170px] flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{WEEKDAYS[(day.getDay() + 6) % 7]}</p>
                                                <p className={`text-sm font-black ${isToday ? 'text-blue-700' : 'text-slate-700'}`}>{day.getDate()}</p>
                                            </div>
                                            {dayEvents.length > 0 && <span className="text-[9px] font-bold text-slate-400">{dayEvents.length}</span>}
                                        </div>
                                        <div className="space-y-1">
                                            {dayEvents.map((event) => (
                                                <EventChip key={event.key} event={event} onSelect={setSelected} compact />
                                            ))}
                                            {dayEvents.length === 0 && <p className="text-[10px] italic text-slate-400">Sin eventos</p>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {view === 'day' && (
                    <div className="space-y-2">
                        {(eventsByDay[dayKey(cursor)] || []).length > 0 ? (
                            (eventsByDay[dayKey(cursor)] || []).map((event) => (
                                <button
                                    key={event.key}
                                    type="button"
                                    onClick={() => setSelected(event)}
                                    className={`w-full text-left rounded-xl border p-3 transition ${getStyle(event.status).chip}`}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className={`w-2 h-2 rounded-full shrink-0 ${getStyle(event.status).dot}`} />
                                            <span className="text-sm font-black shrink-0">{event.time}</span>
                                            <span className="text-sm font-semibold truncate">{event.title}</span>
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-wider shrink-0">{event.status}</span>
                                    </div>
                                    {event.location && (
                                        <div className="mt-1 flex items-center gap-1 text-[11px] opacity-80">
                                            <MapPin className="w-3 h-3" />
                                            <span className="truncate">{event.location}</span>
                                        </div>
                                    )}
                                </button>
                            ))
                        ) : (
                            <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center">
                                <CalendarDays className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                                <p className="text-sm font-bold text-slate-500">No hay eventos para este día</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {selected && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)}>
                    <div className="h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto" onClick={(event) => event.stopPropagation()}>
                        <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${selectedStyle.badge}`}>
                                    {selected.status}
                                </span>
                                <h3 className="text-lg font-black text-slate-900 mt-2 truncate">{selected.title}</h3>
                                <p className="text-xs text-slate-500">{selected.type === 'booking' ? 'Reserva / Cita agendada' : 'Cita de negocio'}</p>
                            </div>
                            <button type="button" onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Fecha</p>
                                    <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                        <CalendarDays className="w-4 h-4 text-slate-400" />
                                        {formatLongDate(selected.start)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Hora</p>
                                    <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                        <Clock className="w-4 h-4 text-slate-400" />
                                        {selected.time}
                                    </p>
                                </div>
                            </div>

                            {selected.client && (
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Cliente</p>
                                    <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                        <User className="w-4 h-4 text-slate-400" />
                                        {selected.client}
                                    </p>
                                </div>
                            )}

                            {selected.company && (
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Empresa</p>
                                    <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                        <Building2 className="w-4 h-4 text-slate-400" />
                                        {selected.company}
                                    </p>
                                </div>
                            )}

                            {selected.service && (
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Servicio</p>
                                    <p className="text-sm text-slate-700">{selected.service}</p>
                                </div>
                            )}

                            {selected.deal_title && (
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Negocio vinculado</p>
                                    <p className="text-sm text-slate-700">{selected.deal_title}</p>
                                    {selected.deal_stage && <p className="text-[11px] font-bold text-violet-600 mt-0.5">{selected.deal_stage}</p>}
                                </div>
                            )}

                            {selected.location && (
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Ubicación</p>
                                    <p className="text-sm text-slate-700 flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                        {selected.location}
                                    </p>
                                </div>
                            )}

                            {selected.modality && (
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Modalidad</p>
                                    <p className="text-sm text-slate-700 flex items-center gap-1.5">
                                        <Video className="w-4 h-4 text-slate-400" />
                                        {selected.modality}
                                    </p>
                                </div>
                            )}

                            {selected.meeting_link && (
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Enlace de reunión</p>
                                    <a href={selected.meeting_link} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1.5 break-all">
                                        <ExternalLink className="w-4 h-4 shrink-0" />
                                        {selected.meeting_link}
                                    </a>
                                </div>
                            )}

                            {(selected.contact_phone || selected.contact_email) && (
                                <div className="grid grid-cols-2 gap-4">
                                    {selected.contact_phone && (
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Teléfono</p>
                                            <p className="text-sm text-slate-700">{selected.contact_phone}</p>
                                        </div>
                                    )}
                                    {selected.contact_email && (
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Email</p>
                                            <p className="text-sm text-slate-700 break-all">{selected.contact_email}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {selected.amount && (
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Valor estimado</p>
                                    <p className="text-lg font-black text-slate-900">{selected.amount}</p>
                                </div>
                            )}

                            {selected.notes && (
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Notas</p>
                                    <p className="text-sm text-slate-700 whitespace-pre-line">{selected.notes}</p>
                                </div>
                            )}
                        </div>

                        <div className="p-5 border-t border-slate-100 space-y-2">
                            {selected.type === 'booking' && (
                                <>
                                    <button type="button" onClick={() => handleStatusChange('Confirmada')} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition">
                                        <CheckCircle className="w-4 h-4" />
                                        Confirmar cita
                                    </button>
                                    <button type="button" onClick={() => handleStatusChange('Completada')} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black transition">
                                        <CheckCircle className="w-4 h-4" />
                                        Marcar completada
                                    </button>
                                    <button type="button" onClick={() => handleStatusChange('Cancelada')} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition">
                                        <Ban className="w-4 h-4" />
                                        Cancelar cita
                                    </button>
                                </>
                            )}

                            {selected.type === 'deal' && onOpenDeal && (
                                <button
                                    type="button"
                                    onClick={() => { onOpenDeal(selected.deal_id); setSelected(null); }}
                                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Abrir negocio
                                </button>
                            )}

                            <button type="button" onClick={() => setSelected(null)} className="w-full px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
