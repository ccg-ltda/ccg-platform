<?php

namespace App\Listeners;

use App\Events\DealCreated;
use App\Models\User;
use Illuminate\Support\Facades\Notification;

class SendDealCreatedEmail
{
    public function handle(DealCreated $event): void
    {
        $deal = $event->deal;
        $company = $deal->company;

        if (!$company || $company->plan_type !== 'vip') {
            return;
        }

        $recipients = User::where('company_id', $deal->company_id)
            ->where('plan_type', 'vip')
            ->get();

        if ($recipients->isNotEmpty()) {
            Notification::send($recipients, new \App\Notifications\DealCreatedEmailNotification($deal));
        }
    }
}
