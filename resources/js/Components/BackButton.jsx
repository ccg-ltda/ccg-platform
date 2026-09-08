import { Link } from '@inertiajs/react';

export default function BackButton({ href = '/dashboard', label = 'Regresar' }) {
    const handleClick = (e) => {
        if (window.history.length > 1) {
            e.preventDefault();
            window.history.back();
        }
    };

    return (
        <Link
            href={href}
            onClick={handleClick}
            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
            <svg
                className="me-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
            </svg>
            {label}
        </Link>
    );
}
