<?php

namespace Tests\Feature;

use App\Models\ClosetItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ClosetEndpointsTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_requires_authentication(): void
    {
        $this->getJson('/api/v1/closet-items')->assertUnauthorized();
        $this->postJson('/api/v1/closet-items', [])->assertUnauthorized();
    }

    public function test_it_lists_only_my_items(): void
    {
        $me = User::factory()->create();
        ClosetItem::factory()->count(2)->create(['user_id' => $me->id]);
        ClosetItem::factory()->create();
        Sanctum::actingAs($me);

        $this->getJson('/api/v1/closet-items')->assertOk()->assertJsonCount(2, 'data');
    }

    public function test_it_creates_an_item_without_a_photo(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/v1/closet-items', ['name' => 'Old denim', 'category' => 'bottom', 'color' => 'blue'])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Old denim')
            ->assertJsonPath('data.category', 'bottom')
            ->assertJsonPath('data.image_url', null);

        $this->assertDatabaseCount('closet_items', 1);
    }

    public function test_it_stores_an_uploaded_photo(): void
    {
        Storage::fake('public');
        Sanctum::actingAs(User::factory()->create());

        $response = $this->post('/api/v1/closet-items', [
            'name' => 'White shirt',
            'category' => 'top',
            'image' => UploadedFile::fake()->createWithContent(
                'shirt.png',
                base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
            ),
        ], ['Accept' => 'application/json'])->assertCreated();

        $this->assertNotNull($response->json('data.image_url'));
        Storage::disk('public')->assertExists(ClosetItem::firstOrFail()->image_path);
    }

    public function test_it_validates_the_input(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/v1/closet-items', ['category' => 'hats'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'category']);
    }

    public function test_it_updates_my_item(): void
    {
        $me = User::factory()->create();
        $item = ClosetItem::factory()->create(['user_id' => $me->id, 'name' => 'Old']);
        Sanctum::actingAs($me);

        $this->putJson("/api/v1/closet-items/{$item->id}", ['name' => 'New'])
            ->assertOk()
            ->assertJsonPath('data.name', 'New');
    }

    public function test_someone_elses_item_is_a_404(): void
    {
        $theirs = ClosetItem::factory()->create();
        Sanctum::actingAs(User::factory()->create());

        $this->putJson("/api/v1/closet-items/{$theirs->id}", ['name' => 'Hacked'])->assertNotFound();
        $this->deleteJson("/api/v1/closet-items/{$theirs->id}")->assertNotFound();

        $this->assertDatabaseHas('closet_items', ['id' => $theirs->id, 'name' => $theirs->name]);
    }

    public function test_deleting_removes_the_item_and_its_photo(): void
    {
        Storage::fake('public');
        $me = User::factory()->create();
        Storage::disk('public')->put('closet/a.jpg', 'x');
        $item = ClosetItem::factory()->create(['user_id' => $me->id, 'image_path' => 'closet/a.jpg']);
        Sanctum::actingAs($me);

        $this->deleteJson("/api/v1/closet-items/{$item->id}")->assertNoContent();

        $this->assertDatabaseCount('closet_items', 0);
        Storage::disk('public')->assertMissing('closet/a.jpg');
    }
}