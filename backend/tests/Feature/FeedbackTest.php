<?php

namespace Tests\Feature;

use App\Models\Feedback;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FeedbackTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_requires_authentication(): void
    {
        $this->postJson('/api/v1/feedback', ['rating' => 5])->assertUnauthorized();
    }

    public function test_a_user_can_send_feedback(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/feedback', ['rating' => 4, 'comment' => 'Nice avatar', 'page' => 'try-on'])
            ->assertCreated()
            ->assertJsonPath('data.rating', 4);

        $this->assertDatabaseHas('feedback', [
            'user_id' => $user->id,
            'rating' => 4,
            'comment' => 'Nice avatar',
            'page' => 'try-on',
        ]);
    }

    public function test_the_comment_is_optional(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/v1/feedback', ['rating' => 3])->assertCreated();

        $this->assertDatabaseCount('feedback', 1);
    }

    public function test_the_rating_must_be_between_one_and_five(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/v1/feedback', [])->assertUnprocessable()->assertJsonValidationErrors(['rating']);
        $this->postJson('/api/v1/feedback', ['rating' => 6])->assertUnprocessable()->assertJsonValidationErrors(['rating']);
        $this->postJson('/api/v1/feedback', ['rating' => 0])->assertUnprocessable()->assertJsonValidationErrors(['rating']);
    }

    public function test_feedback_belongs_to_a_user(): void
    {
        $feedback = Feedback::factory()->create();

        $this->assertInstanceOf(User::class, $feedback->user);
    }
}