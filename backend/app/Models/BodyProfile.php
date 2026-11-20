<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BodyProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'sizing',
        'height_cm',
        'weight_kg',
        'chest_cm',
        'waist_cm',
        'hips_cm',
    ];

    protected function casts(): array
    {
        return [
            'height_cm' => 'decimal:1',
            'weight_kg' => 'decimal:1',
            'chest_cm' => 'decimal:1',
            'waist_cm' => 'decimal:1',
            'hips_cm' => 'decimal:1',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}