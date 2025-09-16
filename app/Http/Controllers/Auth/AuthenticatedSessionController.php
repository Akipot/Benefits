<?php

namespace App\Http\Controllers\Auth;

use App\Helpers\MyHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response|RedirectResponse
    {
        if (app()->environment('local')) {
            return Inertia::render('Login', [
                // 'canResetPassword' => Route::has('password.request'),
                // 'status' => session('status'),
            ]);
        }
        return redirect()->away(config('app.myhub_url'));
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        // dd($request->all());
        $request->authenticate();

        $request->session()->regenerate();

        return redirect()->intended(route('home', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse|JsonResponse|Response
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'logged-out',
                'redirect' => config('app.myhub_logout_url')
            ]);
        }
        if (app()->environment('local')) {
            return Inertia::render('home');
        }
        return redirect()->away(config('app.myhub_logout_url'));
    }
}
