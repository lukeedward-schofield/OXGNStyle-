<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'category' => $this->category->value,
            'description' => $this->description,
            'price' => (float) $this->price,
            'sizing' => $this->sizing,
            'fit_note' => $this->fit_note,
            'image_url' => $this->image_url,
            'layer_image_url' => $this->layer_image_url,
            'source_url' => $this->source_url,
            'is_sample_data' => $this->is_sample_data,
            'sizes' => ProductSizeResource::collection($this->whenLoaded('sizes')),
            'avatar_color' => $this->avatar_color,
            'avatar_shape' => $this->avatar_shape,
        ];
    }
}