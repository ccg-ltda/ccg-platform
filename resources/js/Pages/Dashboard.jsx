import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard({ stats }) {
    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />
            <div className="mx-auto max-w-7xl">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Panel de control principal
                    </p>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500">Total Usuarios</h3>
                        <p className="mt-2 text-3xl font-bold text-gray-900">
                            {stats?.users ?? 0}
                        </p>
                    </div>
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500">Roles Activos</h3>
                        <p className="mt-2 text-3xl font-bold text-gray-900">
                            {stats?.roles ?? 0}
                        </p>
                    </div>
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500">Permisos</h3>
                        <p className="mt-2 text-3xl font-bold text-gray-900">
                            {stats?.permissions ?? 0}
                        </p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
