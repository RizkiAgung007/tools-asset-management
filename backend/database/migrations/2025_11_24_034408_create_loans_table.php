<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loans', function (Blueprint $table) {
            $table->id();

            $table->string('loan_code')->unique();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('asset_id')->constrained()->onDelete('cascade');
            $table->date('loan_date');
            $table->date('return_date');
            $table->text('reason');

            // LEVEL 1: TEAM LEADERS (Paralel)
            $table->enum('status_tl_user', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignId('approver_tl_user_id')->nullable()->constrained('users');
            $table->dateTime('date_tl_user')->nullable();

            // B. Persetujuan Pemilik Aset (Kepala Unit Aset)
            $table->enum('status_tl_asset', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignId('approver_tl_asset_id')->nullable()->constrained('users');
            $table->dateTime('date_tl_asset')->nullable();

            // LEVEL 2: GENERAL AFFAIR (GA)
            $table->enum('status_ga', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignId('approver_ga_id')->nullable()->constrained('users');
            $table->dateTime('date_ga')->nullable();

            // LEVEL 3: VICE PRESIDENT (VP)
            $table->enum('status_vp', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignId('approver_vp_id')->nullable()->constrained('users');
            $table->dateTime('date_vp')->nullable();

            // --- STATUS FINAL ---
            $table->string('status')->default('pending');
            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loans');
    }
};
