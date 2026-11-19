<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClosetItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'category' => $this->category->value,
            'color' => $this->color,
            'size' => $this->size,
            'image_url' => $this->image_path ? asset('storage/'.$this->image_path) : null,
        ];
    }
}