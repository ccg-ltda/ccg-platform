<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->string('plan_type')->default('normal')->after('status');
            $table->string('subscription_status')->default('active')->after('plan_type');
            $table->date('subscription_expires_at')->nullable()->after('subscription_status');
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn(['plan_type', 'subscription_status', 'subscription_expires_at']);
        });
    }
};
