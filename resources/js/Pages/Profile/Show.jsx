import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Mail,
    Phone,
    Building2,
    CalendarDays,
    Clock,
    FileText,
    Briefcase,
    ClipboardList,
    Pencil,
    ShieldCheck,
    User as UserIcon,
} from 'lucide-react';

const formatDate = (value) => {
    if (!value) return 'No disponible';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'No disponible';
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
};

const formatDateTime = (value) => {
    if (!value) return 'No disponible';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'No disponible';
    return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export default function Show({ user = {}, role = 'cliente', metrics = {} }) {
    const initials = (user.name || user.email || 'U').trim().charAt(0).toUpperCase();

    const accountStatus = (user.status || 'pendiente').toLowerCase();
    const statusStyles = {
        activo: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        aprobado: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        pendiente: 'bg-amber-50 text-amber-700 border-amber-200',
        rechazado: 'bg-rose-50 text-rose-700 border-rose-200',
        inactivo: 'bg-gray-100 text-gray-600 border-gray-200',
    };
    const statusLabels = {
        activo: 'Activo',
        aprobado: 'Aprobado',
        pendiente: 'Pendiente',
        rechazado: 'Rechazado',
        inactivo: 'Inactivo',
    };

    const companyName = typeof user.company === 'object' ? user.company?.name : user.company;

    const infoItems = [
        { icon: Phone, label: 'Teléfono', value: user.phone || 'Sin teléfono' },
        { icon: Building2, label: 'Organización', value: user.operacion || companyName || 'Sin organización' },
        { icon: CalendarDays, label: 'Fecha de registro', value: formatDate(user.created_at) },
        { icon: Clock, label: 'Última conexión', value: formatDateTime(user.updated_at) },
    ];

    const metricItems = [
        { icon: ClipboardList, label: 'Solicitudes realizadas', value: metrics.requests ?? 0 },
        { icon: FileText, label: 'Cotizaciones asociadas', value: metrics.quotations ?? 0 },
        { icon: Briefcase, label: 'Negocios asignados', value: metrics.deals ?? 0 },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Mi Perfil" />

            <div className="space-y-6">
                {/* Banner de usuario */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="w-24 h-24 shrink-0 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-3xl font-black text-white shadow-lg">
                            {initials}
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-2xl font-black text-gray-900">{user.name || 'Sin nombre'}</h1>
                            <div className="flex items-center justify-center sm:justify-start gap-2 mt-1 text-sm text-gray-600">
                                <Mail className="w-4 h-4" />
                                <span>{user.email || 'Sin correo'}</span>
                            </div>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 border border-blue-200 text-blue-700">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    {role}
                                </span>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusStyles[accountStatus] || statusStyles.pendiente}`}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                    {statusLabels[accountStatus] || accountStatus}
                                </span>
                            </div>
                        </div>
                        <Link
                            href={route('profile.edit')}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm"
                        >
                            <Pencil className="w-4 h-4" />
                            Editar Perfil
                        </Link>
                    </div>
                </div>

                {/* Información General */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                        <UserIcon className="w-5 h-5 text-blue-600" />
                        Información General
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {infoItems.map((item) => (
                            <div key={item.label} className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
                                <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-600">
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{item.label}</p>
                                    <p className="text-sm font-semibold text-gray-900 mt-0.5">{item.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Resumen de Actividad */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-blue-600" />
                        Resumen de Actividad
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-3">
                        {metricItems.map((item) => (
                            <div key={item.label} className="text-center p-5 rounded-xl bg-gray-50 border border-gray-200">
                                <div className="mx-auto w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 border border-blue-200 text-blue-600 mb-3">
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <p className="text-3xl font-black text-gray-900">{item.value}</p>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
