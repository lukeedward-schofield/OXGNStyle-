<?php

namespace App\Models;

use App\Enums\ProductCategory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'category' => ProductCategory::class,
            'price' => 'decimal:2',
            'is_sample_data' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function sizes(): HasMany
    {
        return $this->hasMany(ProductSize::class);
    }
}