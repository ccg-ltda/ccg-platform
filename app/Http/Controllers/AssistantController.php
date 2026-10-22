<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AssistantController extends Controller
{
    public function store(Request $request)
    {
        $message = strtolower(trim($request->input('message', '')));

        $response = match (true) {
            str_contains($message, 'reserva') || str_contains($message, 'cita') => 
                'Para crear una reserva o cita, dirígete al menú "Reservas" en la barra lateral y haz clic en "Nueva Reserva", completa los datos del cliente, fecha y hora.',
            
            str_contains($message, 'reporte') || str_contains($message, 'metric') || str_contains($message, 'estadística') => 
                'Puedes ver los reportes detallados, KPIs y gráficos en el "Centro de Reportes" en el menú principal. Los superadmins también pueden filtrar por organización y exportar a Excel.',
            
            str_contains($message, 'perfil') || str_contains($message, 'cuenta') || str_contains($message, 'contraseña') => 
                'Para gestionar tu información personal o cambiar tu contraseña, haz clic en tu nombre o avatar en la esquina superior derecha y selecciona "Perfil".',
            
            str_contains($message, 'cotiza') || str_contains($message, 'negocio') || str_contains($message, 'deal') => 
                'Puedes gestionar las cotizaciones y oportunidades de negocio (deals) desde las secciones correspondientes en el menú lateral de gestión comercial.',
            
            str_contains($message, 'hola') || str_contains($message, 'saludos') || str_contains($message, 'ayuda') => 
                '¡Hola! Soy AVA, tu asistente virtual en CCG Platform. Puedo ayudarte con dudas sobre reservas, reportes, perfil y navegación del sistema. ¿Qué necesitas consultar?',
            
            default => 'Entiendo tu consulta. Como asistente AVA, te recomiendo revisar el menú lateral para acceder a los módulos de Negocios, Reservas, Reportes o Usuarios. ¿Hay algo específico sobre estos módulos en lo que te pueda orientar?'
        };

        return response()->json([
            'reply' => $response,
        ]);
    }
}
