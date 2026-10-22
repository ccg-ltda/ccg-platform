<?php

namespace App\Events;

use App\Models\Deal;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DealCreated
{
    use Dispatchable, SerializesModels;

    public Deal $deal;

    public function __construct(Deal $deal)
    {
        $this->deal = $deal;
    }
}
