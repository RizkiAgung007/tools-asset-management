<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Department
        $deptIT = Department::create(['name' => 'Information Technology']);
        $unitDevOps = Unit::create(['name'   => 'Corp. IT Solution', 'department_id' => $deptIT->id]);

        // Dept GA
        $deptGA = Department::create(['name' => 'General Affair']);
        $unitAsset = Unit::create(['name'    => 'Asset Management', 'department_id' => $deptGA->id]);

        // Superadmin Account
        User::create([
            'name'       => 'Superadmin',
            'email'      => 'superadmin@gmail.com',
            'password'   => Hash::make('password'),
            'role'       => 'Superadmin',
            'unit_id'    => null,
            'manager_id' => null
        ]);

        // GA Account
        User::create([
            'name'       => 'Budi Andreas',
            'email'      => 'ga@email.com',
            'password'   => Hash::make('password'),
            'role'       => 'GA',
            'unit_id'    => $unitAsset->id,
            'manager_id' => null,
        ]);

        echo "✅ Data awal berhasil dibuat! \n";
    }
}
