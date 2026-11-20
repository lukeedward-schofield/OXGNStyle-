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
        Schema::table('products', function (Blueprint $table) {
            $table->string('avatar_color', 7)->nullable(); // hex, e.g. #1f3a5f
            $table->string('avatar_shape', 20)->nullable(); // tee | tank | jeans | shorts to tee | tank | pants | shorts
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['avatar_color', 'avatar_shape']);
        });
    }
};
