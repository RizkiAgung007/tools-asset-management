<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Unit;
use App\Models\Department;
use App\Models\AssetStatus;
use App\Models\Category;
use App\Models\Location;
use App\Models\Supplier;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

use function PHPSTORM_META\type;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {

        // Status Aset
        AssetStatus::firstOrCreate(['slug' => 'ready'], ['name' => 'Ready', 'style' => 'success', 'is_deployable' => true]);
        AssetStatus::firstOrCreate(['slug' => 'in-use'], ['name' => 'In Use', 'style' => 'info', 'is_deployable' => false]);
        AssetStatus::firstOrCreate(['slug' => 'broken'], ['name' => 'Broken', 'style' => 'danger', 'is_deployable' => false]);
        AssetStatus::firstOrCreate(['slug' => 'maintenance'], ['name' => 'Maintenance', 'style' => 'warning', 'is_deployable' => false]);

        // Category
        $catElektronik = Category::firstOrCreate(['slug' => 'elektronik'], ['name' => 'Elektronik', 'code' => 'EL']);
        Category::firstOrCreate(['slug' => 'laptop'], ['name' => 'Laptop', 'code' => 'LAP', 'parent_id' => $catElektronik->id, 'useful_life' => 4]);
        Category::firstOrCreate(['slug' => 'proyektor'], ['name' => 'Proyektor', 'code' => 'PRJ', 'parent_id' => $catElektronik->id, 'useful_life' => 5]);

        // Location Building
        $building = Location::firstOrCreate(['slug' => 'kantor-pusat'], ['name' => 'Kantor Pusat', 'type' => 'building', 'address' => 'Jl. Jend Sudirman']);

        // Location Floor
        $floor = Location::firstOrCreate(['slug' => 'lantai-1-kantor-pusat'], ['name' => 'lantai 1', 'type' => 'floor', 'parent_id' => $building->id]);

        // Location Room
        Location::firstOrCreate(['slug' => 'ruang-meeting-lantai-1'], ['name' => 'Ruang Meeting Lantai 1', 'type' => 'room', 'parent_id' => $floor->id, 'description' => 'Sebelah Lobby Utama']);

        // Supplier
        Supplier::firstOrCreate(['name' => 'PT. Vendor Jaya'], ['contact_person' => 'Budi Sales', 'phone' => '0812345678', 'email' => 'sales@vendor.com', 'address' => 'JL. Mawar Melati']);


        // Organizational structure (Departemen & Unit)

        $deptTech = Department::firstOrCreate(['name' => 'Technology']);
        $deptBiz  = Department::firstOrCreate(['name' => 'Business']);
        $deptOps  = Department::firstOrCreate(['name' => 'Operations']);

        $unitIT   = Unit::firstOrCreate(['name' => 'IT Development'], ['department_id' => $deptTech->id]);
        $unitMkt  = Unit::firstOrCreate(['name' => 'Marketing'], ['department_id' => $deptBiz->id]);
        $unitGA   = Unit::firstOrCreate(['name' => 'General Affair'], ['department_id' => $deptOps->id]);


        // USERS
        $password = Hash::make('password');

        // SUPER ADMIN
        User::firstOrCreate(['email' => 'superadmin@gmail.com'], [
            'name' => 'Super Administrator',
            'password' => $password,
            'role' => 'superadmin',
            'unit_id' => null,
        ]);

        // VP (VICE PRESIDENT)
        $vpUser = User::firstOrCreate(['email' => 'vp@kantor.com'], [
            'name' => 'Pak VP (Vice President)',
            'password' => $password,
            'role' => 'vp',
            'unit_id' => null,
        ]);

        // ADMIN GA (GENERAL AFFAIR)
        $gaUser = User::firstOrCreate(['email' => 'ga@kantor.com'], [
            'name' => 'Admin GA',
            'password' => $password,
            'role' => 'ga',
            'unit_id' => $unitGA->id,
            'manager_id' => $vpUser->id,
        ]);

        // DIVISI IT
        // Head IT
        $headIT = User::firstOrCreate(['email' => 'head.it@kantor.com'], [
            'name' => 'Head of IT',
            'password' => $password,
            'role' => 'head',
            'unit_id' => $unitIT->id,
            'manager_id' => $vpUser->id,
        ]);

        // Staff IT
        $staffIT = User::firstOrCreate(['email' => 'staff.it@kantor.com'], [
            'name' => 'Staff IT (Teknisi)',
            'password' => $password,
            'role' => 'staff',
            'unit_id' => $unitIT->id,
            'manager_id' => $headIT->id,
        ]);

        // DIVISI MARKETING (Borrower asset)
        // Head Marketing
        $headMkt = User::firstOrCreate(['email' => 'head.mkt@kantor.com'], [
            'name' => 'Head of Marketing',
            'password' => $password,
            'role' => 'head',
            'unit_id' => $unitMkt->id,
            'manager_id' => $vpUser->id,
        ]);

        // Staff Marketing
        $staffMkt = User::firstOrCreate(['email' => 'staff.mkt@kantor.com'], [
            'name' => 'Staff Marketing (Peminjam)',
            'password' => $password,
            'role' => 'staff',
            'unit_id' => $unitMkt->id,
            'manager_id' => $headMkt->id,
        ]);

        echo "\n✅ DATABASE SEEDING SELESAI! \n";
        echo "--------------------------------------------------\n";
        echo "1. Akun Superadmin : admin@kantor.com (Akses Semua)\n";
        echo "2. Akun Peminjam   : staff.mkt@kantor.com (Staff Marketing)\n";
        echo "3. Akun Approver 1 : head.mkt@kantor.com (Atasan Peminjam)\n";
        echo "4. Akun Approver 2 : head.it@kantor.com (Pemilik Aset)\n";
        echo "5. Akun Approver 3 : ga@kantor.com (General Affair)\n";
        echo "6. Akun Approver 4 : vp@kantor.com (Vice President)\n";
        echo "Password Semua     : password\n";
    }
}
