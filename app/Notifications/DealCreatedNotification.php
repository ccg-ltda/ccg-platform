<?php

namespace App\Notifications;

use App\Models\Deal;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class DealCreatedNotification extends Notification
{
    use Queueable;

    public Deal $deal;

    public function __construct(Deal $deal)
    {
        $this->deal = $deal;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'deal_id' => $this->deal->id,
            'title' => 'Nuevo negocio creado',
            'message' => "Negocio '{$this->deal->title}' creado en etapa {$this->deal->stage}",
            'deal_title' => $this->deal->title,
            'deal_amount' => $this->deal->amount,
            'deal_stage' => $this->deal->stage,
            'company_id' => $this->deal->company_id,
            'company_name' => $this->deal->company->name ?? null,
        ];
    }
}
