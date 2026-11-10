<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('category');                 // see ProductCategory
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);            // Philippine pesos
            $table->string('sizing')->nullable();       // 'mens' or 'ladies'; null for one-size items
            $table->string('fit_note')->nullable();     // e.g. "Fits true to size"
            $table->string('image_url')->nullable();
            $table->string('layer_image_url')->nullable();
            $table->string('source_url')->nullable();
            $table->boolean('is_sample_data')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
