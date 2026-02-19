<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tabel Header Audit (Laporan Audit)
        Schema::create('audits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('location_id')->constrained()->onDelete('cascade'); // Lokasi yang diaudit
            $table->foreignId('auditor_id')->constrained('users'); // Siapa yang melakukan audit
            $table->date('audit_date');
            $table->text('notes')->nullable(); // Catatan umum (misal: "Ruangan berantakan")
            $table->timestamps();
        });

        // 2. Tabel Detail Item Audit (Checklist Barang)
        Schema::create('audit_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('audit_id')->constrained()->onDelete('cascade');
            $table->foreignId('asset_id')->constrained()->onDelete('cascade');

            // Status hasil cek fisik
            // found: Ada
            // missing: Tidak ada
            // damaged: Ada tapi rusak (kondisi fisik beda dg status sistem)
            $table->enum('status', ['found', 'missing', 'damaged'])->default('found');

            $table->text('notes')->nullable(); // Catatan per barang (misal: "Layar retak")
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_items');
        Schema::dropIfExists('audits');
    }
};
// ```

// #### 3. Jalankan Migrasi
// ```bash
// docker compose run --rm app php artisan migrate
// ```

// ---

// ### TAHAP 2: Update Model (`Audit.php`)

// Kita harus mendefinisikan relasi agar tabel Header bisa memanggil Detail-nya.

// Buka file **`backend/app/Models/Audit.php`**:

// ```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Audit extends Model
{
    use HasFactory;
    protected $guarded = ['id'];

    // Relasi ke Lokasi yang diaudit
    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    // Relasi ke User yang mengaudit
    public function auditor()
    {
        return $this->belongsTo(User::class, 'auditor_id');
    }

    // Relasi ke Item Detail
    public function items()
    {
        return $this->hasMany(AuditItem::class);
    }
}
// ```

// *(Kita juga perlu buat Model `AuditItem`, tapi karena perintah `make:model` tadi cuma satu, kita buat manual sebentar).*

// **Buat file `backend/app/Models/AuditItem.php`:**

// ```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditItem extends Model
{
    protected $guarded = ['id'];

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }
}
