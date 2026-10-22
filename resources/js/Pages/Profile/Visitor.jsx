import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Mail, Calendar, Hash, Eye, Pencil } from 'lucide-react';

export default function Visitor({ profileUser = {}, isOwnProfile = false }) {
    const initials = (profileUser.name || 'U').trim().charAt(0).toUpperCase();

    return (
        <AuthenticatedLayout>
            <Head title={`Perfil de ${profileUser.name || 'Usuario'}`} />

            <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Botón Volver */}
                <div>
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm hover:bg-gray-50 transition"
                    >
                        <ArrowLeft className="w-4 h-4" /> Volver
                    </button>
                </div>

                {/* Encabezado del Perfil */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white font-black text-2xl shadow-md">
                        {initials}
                    </div>
                    <div className="space-y-1 flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 capitalize">{profileUser.name || 'Usuario'}</h1>
                        <p className="text-sm text-gray-500">{profileUser.email || 'Sin correo'}</p>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                            <Eye className="w-3.5 h-3.5" /> {isOwnProfile ? 'Tu Perfil' : 'Vista de solo lectura'}
                        </span>
                    </div>
                    {isOwnProfile && (
                        <Link
                            href={route('profile.edit')}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm"
                        >
                            <Pencil className="w-4 h-4" />
                            Editar Perfil
                        </Link>
                    )}
                </div>

                {/* Tarjetas de Información Pública */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Eye className="w-5 h-5 text-blue-500" /> Información Pública
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-lg"><Mail className="w-5 h-5" /></div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-gray-400 uppercase">Correo Electrónico</p>
                                <p className="text-sm font-semibold text-gray-800 truncate">{profileUser.email || 'Sin correo'}</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-lg"><Calendar className="w-5 h-5" /></div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-gray-400 uppercase">Miembro Desde</p>
                                <p className="text-sm font-semibold text-gray-800">
                                    {profileUser.created_at ? new Date(profileUser.created_at).toLocaleDateString('es-ES') : 'No disponible'}
                                </p>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                            <div className="p-2.5 bg-cyan-100 text-cyan-600 rounded-lg"><Hash className="w-5 h-5" /></div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-gray-400 uppercase">Identificador</p>
                                <p className="text-sm font-semibold text-gray-800">#{profileUser.id ?? '—'}</p>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 pt-2">Solo se muestra información pública. Los datos sensibles y las opciones de configuración no están disponibles en esta vista.</p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
