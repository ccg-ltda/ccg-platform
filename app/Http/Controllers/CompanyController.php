<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CompanyController extends Controller
{
    private function ensureSuperAdmin(): void
    {
        $user = auth()->user();
        if (!$user || (!$user->hasRole('superadmin') && !($user->isSuperAdmin ?? false))) {
            abort(403, 'No autorizado. Se requiere rol Superadmin.');
        }
    }

    public function index(Request $request): Response
    {
        $this->ensureSuperAdmin();

        $companies = Company::latest()->get();
        $totalCompanies = Company::count();
        $activeCompanies = Company::where('status', 'activo')->count();
        $linkedUsers = \App\Models\User::whereNotNull('company_id')->count();

        return Inertia::render('Companies/Index', [
            'companies' => $companies,
            'totalCompanies' => $totalCompanies,
            'activeCompanies' => $activeCompanies,
            'linkedUsers' => $linkedUsers,
            'auth' => [
                'user' => auth()->user(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->ensureSuperAdmin();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'project' => 'required|string|max:255',
            'activity' => 'nullable|string',
            'status' => 'required|in:activo,inactivo',
        ]);

        Company::create($validated);

        return redirect()->route('companies.index');
    }

    public function update(Request $request, Company $company): RedirectResponse
    {
        $this->ensureSuperAdmin();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'project' => 'required|string|max:255',
            'activity' => 'nullable|string',
            'status' => 'required|in:activo,inactivo',
        ]);

        $company->update($validated);

        return redirect()->route('companies.index');
    }

    public function toggleStatus(Company $company): RedirectResponse
    {
        $this->ensureSuperAdmin();

        $newStatus = $company->status === 'activo' ? 'inactivo' : 'activo';
        $company->update(['status' => $newStatus]);

        return redirect()->route('companies.index');
    }

    public function destroy(Company $company): RedirectResponse
    {
        $this->ensureSuperAdmin();

        $company->delete();

        return redirect()->route('companies.index');
    }

    public function switchActiveCompany(Request $request): RedirectResponse
    {
        $this->ensureSuperAdmin();

        $validated = $request->validate([
            'company_id' => 'nullable|exists:companies,id',
        ]);

        session(['active_company_id' => $validated['company_id']]);

        return back();
    }
}
