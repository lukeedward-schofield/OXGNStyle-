<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminProductsTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        $admin = User::factory()->create();
        $admin->forceFill(['is_admin' => true])->save();

        return $admin;
    }

    public function test_admins_can_see_the_product_list(): void
    {
        Product::factory()->create(['name' => 'Visible Sample Tee']);

        $this->actingAs($this->admin())
            ->get('/admin/products')
            ->assertOk()
            ->assertSee('Visible Sample Tee');
    }

    public function test_regular_users_cannot_see_the_product_list(): void
    {
        $this->actingAs(User::factory()->create())
            ->get('/admin/products')
            ->assertForbidden();
    }

    public function test_there_is_no_create_page(): void
    {
        $this->actingAs($this->admin())
            ->get('/admin/products/create')
            ->assertNotFound();
    }
}