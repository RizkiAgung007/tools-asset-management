public function up(): void
{
    Schema::table('categories', function (Blueprint $table) {
        // Kode unik, misal "LAP", "VHCL"
        $table->string('code', 10)->nullable()->unique()->after('name');
    });
}

public function down(): void
{
    Schema::table('categories', function (Blueprint $table) {
        $table->dropColumn('code');
    });
}
