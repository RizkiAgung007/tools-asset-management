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
        Schema::create('maintenances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained()->onDelete('cascade');
            $table->foreignId('supplier_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('reported_id')->nullable()->constrained('users')->onDelete('set null');
            $table->text('issue');
            $table->text('resolution')->nullable();
            $table->enum('status', ['pending', 'in_progress', 'completed'])->default('pending');
            $table->decimal('cost', 15, 2)->nullable();
            $table->date('start_date');
            $table->date('completion_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenances');
    }
};
