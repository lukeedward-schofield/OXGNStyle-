<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['email' => 'admin@example.com'],
            ['name' => 'Admin', 'password' => 'password123'],
        );

        // is_admin is not mass assignable, so set it explicitly.
        $admin->forceFill(['is_admin' => true])->save();
    }
}