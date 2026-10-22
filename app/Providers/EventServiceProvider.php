<?php

namespace App\Providers;

use App\Events\DealCreated;
use App\Listeners\SendDealCreatedEmail;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        DealCreated::class => [
            SendDealCreatedEmail::class,
        ],
    ];

    public function boot(): void
    {
        //
    }

    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
