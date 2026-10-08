<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\Company;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Define the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Handle the incoming request.
     */
    public function handle(Request $request, \Closure $next)
    {
        $response = parent::handle($request, $next);

        $response->headers->set('Cache-Control', 'nocache, no-store, max-age=0, must-revalidate');
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('Expires', 'Fri, 01 Jan 1990 00:00:00 GMT');

        return $response;
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $activeCompanyId = session('active_company_id');
        $activeCompany = $activeCompanyId ? Company::find($activeCompanyId) : null;

        if (!$activeCompany && $user && $user->company_id) {
            $activeCompany = $user->company;
        }

        $companies = ($user && $user->isSuperAdmin()) ? Company::where('status', 'activo')->get(['id', 'name', 'project']) : [];

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? array_merge($user->toArray(), [
                    'role' => $user->roles->pluck('name')->first() ?? 'cliente',
                    'roles' => $user->getRoleNames(),
                    'permissions' => $user->getAllPermissions()->pluck('name'),
                    'is_superadmin' => $user->isSuperAdmin(),
                    'operacion' => $user->operacion ?? 'Sin Organización',
                    'company' => $user->company ? $user->company->name : null,
                    'company_id' => $user->company_id,
                ]) : null,
            ],
            'activeCompany' => $activeCompany,
            'companies' => $companies,
        ];
    }
}
