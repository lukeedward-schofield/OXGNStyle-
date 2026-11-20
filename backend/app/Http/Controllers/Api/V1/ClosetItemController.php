<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreClosetItemRequest;
use App\Http\Requests\Api\V1\UpdateClosetItemRequest;
use App\Http\Resources\Api\V1\ClosetItemResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

class ClosetItemController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return ClosetItemResource::collection(
            $request->user()->closetItems()->latest('id')->get()
        );
    }

    public function store(StoreClosetItemRequest $request): ClosetItemResource
    {
        $data = $request->safe()->except('image');

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('closet', 'public');
        }

        return new ClosetItemResource($request->user()->closetItems()->create($data));
    }

    public function update(UpdateClosetItemRequest $request, int $id): ClosetItemResource
    {
        // Looked up through the user's own items, so someone else's id is a 404.
        $item = $request->user()->closetItems()->findOrFail($id);
        $item->update($request->validated());

        return new ClosetItemResource($item);
    }

    public function destroy(Request $request, int $id): Response
    {
        $item = $request->user()->closetItems()->findOrFail($id);

        if ($item->image_path) {
            Storage::disk('public')->delete($item->image_path);
        }
        $item->delete();

        return response()->noContent();
    }
}