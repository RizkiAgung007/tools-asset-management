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
        Schema::create('assets', function (Blueprint $table) {
            $table->id();

            $table->foreignId('category_id')->constrained()->onDelete('restrict');
            $table->foreignId('location_id')->constrained()->onDelete('restrict');
            $table->foreignId('supplier_id')->constrained()->nullOnDelete();
            $table->foreignId('asset_status_id')->constrained('asset_statuses')->onDelete('restrict');
            $table->foreignId('unit_id')->nullable()->constrained('units')->onDelete('set null');

            $table->string('name');
            $table->string('code')->unique();
            $table->string('serial_number')->nullable();
            $table->date('purchase_date')->nullable();
            $table->decimal('purchase_price', 15, 2)->nullable();
            $table->integer('useful_life')->nullable();

            $table->string('image_path')->nullable();
            $table->text('description')->nullable();

            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};
