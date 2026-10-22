<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();
        $isSuperAdmin = $user->hasRole('superadmin') || ($user->is_superadmin ?? false);

        $notifications = $user->notifications()
            ->when(!$isSuperAdmin, function ($query) use ($user) {
                $query->where('data->company_id', $user->company_id);
            })
            ->limit(50)
            ->get();

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
        ]);
    }

    public function markAsRead(Request $request, string $id)
    {
        $notification = auth()->user()->notifications()->where('id', $id)->first();

        if ($notification) {
            $notification->markAsRead();
        }

        return back();
    }
}
