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
        Schema::create('loans', function (Blueprint $table) {
            $table->id();

            // Loan Information
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('item_detail');
            $table->text('reason');
            $table->date('load_date');
            $table->date('return_date');

            // Multi Approval
            $table->tinyInteger('status_team_lead')->default(0);
            $table->timestamp('team_lead_approval_date')->nullable();

            $table->tinyInteger('status_ga')->default(0);
            $table->timestamp('ga_approval_date')->nullable();

            $table->tinyInteger('status_vp')->default(0);
            $table->timestamp('vp_approval_date')->nullable();

            // Status
            $table->string('status')->default('Pending');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loans');
    }
};
