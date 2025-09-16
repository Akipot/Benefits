<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use Illuminate\Support\Facades\Log;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule)
    {
        // Debug line to confirm schedule() is called
        Log::info('Kernel::schedule() called');

        // Scheduler task
        $schedule->call(function () {
            Log::info('Scheduler is working at ' . now());
        })->everyMinute(); // Laravel minimum frequency
    }

    protected function commands()
    {
        $this->load(__DIR__ . '/Commands');
        require base_path('routes/console.php');
    }
}
