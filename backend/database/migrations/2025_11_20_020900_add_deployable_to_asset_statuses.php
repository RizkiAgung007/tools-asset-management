<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('asset_statuses', function (Blueprint $table) {
            $table->boolean('is_deployable')->default(true)->after('style');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('asset_statuses', function (Blueprint $table) {
            $table->dropColumn('is_deployable');
        });
    }
};
