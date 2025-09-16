<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;
use Illuminate\Support\Facades\DB;
use App\Helpers\MyHelper;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    // public function share(Request $request): array
    // {
    //     [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

    //     return [
    //         ...parent::share($request),
    //         'name' => config('app.name'),
    //         'quote' => ['message' => trim($message), 'author' => trim($author)],
    //         'auth' => [
    //             'user' => $request->user(),
    //         ],
    //         'ziggy' => fn (): array => [
    //             ...(new Ziggy)->toArray(),
    //             'location' => $request->url(),
    //         ],
    //         'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
    //     ];
    // }
    public function share(Request $request): array
    {

        $params = $request->query('params');
        parse_str($params, $parsedParams);
        $employeeID = $parsedParams['employeeID'] ?? null;
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => tap($request->user()->load('info'), function ($user) {
                        
                    $user->info->location = DB::select('UserMgt_prd.dbo.sp_User_Get ?', [$user->Usr_ID])[0] ?? null;
                    // $user->info->location = DB::select('UserMgt_prd.dbo.sp_User_Get ?', [$user->info->Employee_ID])[0] ?? null;
                    // dd($user->info);
                }),

            ],
            'ziggy' => fn(): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'employeeID' => $employeeID,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }

//     public function share(Request $request): array
//     {
//         // Parse employee ID from query
//         $params = $request->query('params');
//         parse_str($params, $parsedParams);
//         $employeeID = $parsedParams['employeeID'] ?? null;
//         // dd($employeeID);

//         // Split a random quote
//         [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

//         return [
//             ...parent::share($request),
//             'name' => config('app.name'),
//             'quote' => ['message' => trim($message), 'author' => trim($author)],
//             'auth' => [
//                 'user' => tap($request->user()->load('info'), function ($user) use ($request) {
//                     // Build parameter array
//                     $params = [$user->info->Employee_ID]; // Adjust as needed

//                     // Correct DB call
//                     $user->info->location = DB::select(
//                         'UserMgt_prd.dbo.sp_User_Get ?',
//                         $params
//                     )[0] ?? null;

//                     // If you want to debug here:
//                     dd($user->info->location);
//                 }),
//             ],
//             'ziggy' => fn(): array => [
//                 ...(new Ziggy)->toArray(),
//                 'location' => $request->url(),
//             ],
//             'employeeID' => $employeeID,
//             'sidebarOpen' => ! $request->hasCookie('sidebar_state')
//                 || $request->cookie('sidebar_state') === 'true',
//         ];
// }

}
