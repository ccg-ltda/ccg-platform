<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckUserStatus
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && $request->user()->status === 'pendiente' && !$request->user()->isSuperAdmin()) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Tu cuenta está pendiente de aprobación por el Superadmin. Organización solicitada: ' . $request->user()->operacion], 403);
            }
            return redirect()->route('dashboard')->with('warning', 'Tu cuenta está pendiente de aprobación por el Superadmin. Organización solicitada: ' . $request->user()->operacion);
        }

        return $next($request);
    }
}
