<?php

namespace App\Notifications;

use App\Models\Deal;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DealCreatedEmailNotification extends Notification
{
    use Queueable;

    public Deal $deal;

    public function __construct(Deal $deal)
    {
        $this->deal = $deal;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $company = $this->deal->company;

        return (new MailMessage)
            ->subject('Nuevo Negocio Creado - ' . $this->deal->title)
            ->greeting('Hola ' . $notifiable->name . ',')
            ->line('Se ha creado un nuevo negocio en el pipeline:')
            ->line('')
            ->line('Título: ' . $this->deal->title)
            ->line('Empresa: ' . ($company->name ?? 'N/A'))
            ->line('Valor: $' . number_format($this->deal->amount, 0, ',', '.') . ' COP')
            ->line('Etapa: ' . $this->deal->stage)
            ->line('Fecha de cierre estimado: ' . ($this->deal->expected_close_date?->format('d/m/Y') ?? 'N/A'))
            ->line('')
            ->action('Ver Negocio', url('/deals'))
            ->line('Gracias por usar CCG Platform.');
    }
}
