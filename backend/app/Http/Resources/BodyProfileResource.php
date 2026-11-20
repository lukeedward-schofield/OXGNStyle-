<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BodyProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'sizing' => $this->sizing,
            'height_cm' => (float) $this->height_cm,
            'weight_kg' => $this->weight_kg === null ? null : (float) $this->weight_kg,
            'chest_cm' => (float) $this->chest_cm,
            'waist_cm' => (float) $this->waist_cm,
            'hips_cm' => (float) $this->hips_cm,
        ];
    }
}