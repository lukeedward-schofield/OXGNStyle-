<?php

namespace Tests\Feature;

use App\Models\BodyProfile;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BodyProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_has_one_body_profile(): void
    {
        $user = User::factory()->create();
        BodyProfile::factory()->create(['user_id' => $user->id, 'chest_cm' => 101.5]);

        $this->assertSame('101.5', $user->bodyProfile->chest_cm);
    }

    public function test_a_user_cannot_have_two_profiles(): void
    {
        $user = User::factory()->create();
        BodyProfile::factory()->create(['user_id' => $user->id]);

        $this->expectException(QueryException::class);
        BodyProfile::factory()->create(['user_id' => $user->id]);
    }
}