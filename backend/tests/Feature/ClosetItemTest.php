<?php

namespace Tests\Feature;

use App\Enums\ProductCategory;
use App\Models\ClosetItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClosetItemTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_has_many_closet_items(): void
    {
        $user = User::factory()->create();
        ClosetItem::factory()->count(2)->create(['user_id' => $user->id]);
        ClosetItem::factory()->create();

        $this->assertCount(2, $user->closetItems);
    }

    public function test_category_is_cast_to_an_enum(): void
    {
        $item = ClosetItem::factory()->create(['category' => 'top']);

        $this->assertSame(ProductCategory::Top, $item->fresh()->category);
    }

    public function test_deleting_a_user_deletes_their_closet(): void
    {
        $user = User::factory()->create();
        ClosetItem::factory()->create(['user_id' => $user->id]);

        $user->delete();

        $this->assertDatabaseCount('closet_items', 0);
    }
}