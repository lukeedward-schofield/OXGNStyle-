<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void{
        Schema::create('body_size_charts', function (Blueprint $table) {
            $table->id();
            $table->string('sizing');            // 'mens' or 'ladies'
            $table->string('size');              // XXS ... 3XL
            $table->unsignedTinyInteger('sort_order');
            $table->decimal('chest_min_cm', 5, 1);
            $table->decimal('chest_max_cm', 5, 1);
            $table->decimal('waist_min_cm', 5, 1);
            $table->decimal('waist_max_cm', 5, 1);
            $table->decimal('hips_min_cm', 5, 1);
            $table->decimal('hips_max_cm', 5, 1);
            $table->timestamps();

            $table->unique(['sizing', 'size']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('body_size_charts');
    }
};
