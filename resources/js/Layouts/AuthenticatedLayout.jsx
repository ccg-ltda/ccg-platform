import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

const NAV_ITEMS = [
    { name: 'Dashboard', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1', permissions: null },
    { name: 'Usuarios', href: '/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z', permissions: ['view-users', 'manage-users'] },
];

export default function AuthenticatedLayout({ children }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const userRoles = user?.roles || [];
    const permissions = auth?.user?.permissions || [];
    const canViewUsers = permissions.includes('view-users') || permissions.includes('manage-users');

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const visibleNavItems = NAV_ITEMS.filter(
        (item) => !item.permissions || item.permissions.some((p) => permissions.includes(p)),
    );

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-gray-900 text-white transition-transform duration-200 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex h-16 items-center justify-center border-b border-gray-700">
                    <span className="text-xl font-bold">Laravel React Base</span>
                </div>
                <nav className="mt-4 space-y-1 px-2">
                    {visibleNavItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center rounded-lg px-4 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <svg
                                className="me-3 h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d={item.icon}
                                />
                            </svg>
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main content */}
            <div className="flex flex-1 flex-col lg:ml-64">
                {/* Header */}
                <header className="sticky top-0 z-30 bg-white shadow-sm">
                    <div className="flex items-center justify-between px-4 py-3 sm:px-6">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 lg:hidden"
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500">
                                {user?.email}
                            </span>
                            {userRoles.length > 0 && (
                                <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                                    {userRoles[0]}
                                </span>
                            )}
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700"
                            >
                                Cerrar Sesión
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
