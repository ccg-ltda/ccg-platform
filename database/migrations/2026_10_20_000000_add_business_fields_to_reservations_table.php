<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->string('modality')->default('Presencial')->after('location');
            $table->string('meeting_link')->nullable()->after('modality');
            $table->string('contact_phone')->nullable()->after('meeting_link');
            $table->string('contact_email')->nullable()->after('contact_phone');
            $table->time('start_time')->nullable()->after('contact_email');
            $table->time('end_time')->nullable()->after('start_time');
            $table->foreignId('assigned_to')->nullable()->after('user_id')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropForeign(['assigned_to']);
            $table->dropColumn([
                'modality',
                'meeting_link',
                'contact_phone',
                'contact_email',
                'start_time',
                'end_time',
                'assigned_to',
            ]);
        });
    }
};
