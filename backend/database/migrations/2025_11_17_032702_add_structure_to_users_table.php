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
        Schema::table('users', function (Blueprint $table) {
                $table->foreignId('unit_id')->nullable()->constrained('units')->nullOnDelete();
                $table->string('role')->default('staff');
                $table->unsignedBigInteger('manager_id')->nullable();
                $table->foreign('manager_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['unit_id']);
            $table->dropColumn('unit_id');
            $table->dropColumn('role');
            $table->dropForeign(['manager_id']);
            $table->dropColumn('manager_id');
        });
    }
};
