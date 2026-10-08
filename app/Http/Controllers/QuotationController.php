<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class QuotationController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Quotations/Index', [
            'quotations' => [],
            'kpis' => [
                'open_count' => 2,
                'open_value' => '$47.600.000 COP',
                'accepted_count' => 1,
                'conversion_rate' => '42%',
            ],
        ]);
    }
}