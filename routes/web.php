
<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\QuotationController;
use App\Http\Controllers\DealController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\AssistantController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/quotations', [QuotationController::class, 'index'])->name('quotations.index');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

Route::middleware('auth')->group(function () {
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
});

Route::middleware(['auth', 'check.status'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'show'])->name('profile.show');
    Route::get('/profile/edit', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile/{user}', [ProfileController::class, 'showVisitor'])->name('profile.visitor');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::post('/settings/roles/permissions', [SettingsController::class, 'updateRolePermissions'])->name('settings.roles.permissions');
    Route::put('/settings/permissions/update', [SettingsController::class, 'updateRolePermissions'])->name('settings.permissions.update');
    Route::post('/settings/permissions/update', [SettingsController::class, 'updateRolePermissions']);
    Route::post('/settings/branches', [SettingsController::class, 'storeBranch'])->name('settings.branches.store');
    Route::put('/settings/branches/{branch}', [SettingsController::class, 'updateBranch'])->name('settings.branches.update');
    Route::patch('/settings/branches/{branch}/toggle-status', [SettingsController::class, 'toggleBranchStatus'])->name('settings.branches.toggle-status');
    Route::post('/settings/assign-plan', [SettingsController::class, 'assignPlan'])->name('settings.assign-plan');
    Route::resource('users', UserController::class);
    Route::patch('users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggle-status');
    Route::resource('quotations', QuotationController::class);
    Route::patch('quotations/{quotation}/update-status', [QuotationController::class, 'updateStatus'])->name('quotations.update-status');
    Route::resource('deals', DealController::class);
    Route::post('deals/{deal}/schedule-appointment', [DealController::class, 'scheduleAppointment'])->name('deals.schedule-appointment');
    Route::resource('reservations', ReservationController::class);
    Route::patch('reservations/{reservation}/update-status', [ReservationController::class, 'updateStatus'])->name('reservations.update-status');
    Route::get('subscription', [SubscriptionController::class, 'index'])->name('subscription.index');
    Route::patch('subscription', [SubscriptionController::class, 'update'])->name('subscription.update');
    Route::post('subscription/upgrade', [SubscriptionController::class, 'update'])->name('subscriptions.upgrade');
    Route::get('notifications', [App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications/mark-read/{id}', [App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.mark-read');
    Route::post('/api/assistant', [AssistantController::class, 'store'])->name('api.assistant');
});

Route::middleware(['auth', 'role:superadmin'])->group(function () {
    Route::resource('companies', CompanyController::class);
    Route::patch('companies/{company}/toggle-status', [CompanyController::class, 'toggleStatus'])->name('companies.toggle-status');
    Route::post('companies/switch', [CompanyController::class, 'switchActiveCompany'])->name('companies.switch');
});

require __DIR__.'/auth.php';