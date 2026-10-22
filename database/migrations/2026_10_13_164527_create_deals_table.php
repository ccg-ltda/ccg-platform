<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deals', function (Blueprint $create) {
            $create->id();
            $create->string('title');
            $create->foreignId('company_id')->constrained()->onDelete('cascade');
            $create->foreignId('user_id')->constrained()->onDelete('cascade');
            $create->decimal('amount', 15, 2);
            $create->string('stage'); // Cita Programada, Calificado, Presentación, Propuesta / Cotización, Contrato Enviado, Cierre Ganado, Cierre Perdido
            $create->date('expected_close_date');
            $create->text('notes')->nullable();
            $create->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deals');
    }
};
