<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\AdminUserSeeder;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_admins_can_access_the_panel(): void
    {
        $admin = User::factory()->create();
        $admin->forceFill(['is_admin' => true])->save();

        $this->assertTrue($admin->canAccessPanel(Filament::getPanel('admin')));
    }

    public function test_regular_users_cannot_access_the_panel(): void
    {
        $user = User::factory()->create();

        $this->assertFalse($user->canAccessPanel(Filament::getPanel('admin')));
    }

    public function test_registration_cannot_grant_admin(): void
    {
        $this->postJson('/api/v1/register', [
            'name' => 'Sneaky',
            'email' => 'sneaky@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'is_admin' => true,
        ])->assertCreated();

        $this->assertFalse(User::where('email', 'sneaky@example.com')->firstOrFail()->is_admin);
    }

    public function test_the_seeded_admin_is_an_admin(): void
    {
        $this->seed(AdminUserSeeder::class);

        $this->assertTrue(User::where('email', 'admin@example.com')->firstOrFail()->is_admin);
    }

    public function test_the_admin_login_page_loads(): void
    {
        $this->get('/admin/login')->assertOk();
    }
}