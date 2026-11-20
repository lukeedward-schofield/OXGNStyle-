<?php

namespace Tests\Feature;

use App\Models\Feedback;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminFeedbackTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        $admin = User::factory()->create();
        $admin->forceFill(['is_admin' => true])->save();

        return $admin;
    }

    public function test_admins_can_see_feedback(): void
    {
        Feedback::factory()->create(['comment' => 'Loved the avatar']);

        $this->actingAs($this->admin())
            ->get('/admin/feedback')
            ->assertOk()
            ->assertSee('Loved the avatar');
    }

    public function test_regular_users_cannot_see_feedback(): void
    {
        $this->actingAs(User::factory()->create())
            ->get('/admin/feedback')
            ->assertForbidden();
    }
}