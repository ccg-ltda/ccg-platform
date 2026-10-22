<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('deals', function (Blueprint $table) {
            $table->date('appointment_date')->nullable()->after('expected_close_date');
            $table->time('appointment_time')->nullable()->after('appointment_date');
            $table->string('appointment_location')->nullable()->after('appointment_time');
            $table->text('appointment_notes')->nullable()->after('appointment_location');
        });
    }

    public function down(): void
    {
        Schema::table('deals', function (Blueprint $table) {
            $table->dropColumn(['appointment_date', 'appointment_time', 'appointment_location', 'appointment_notes']);
        });
    }
};
