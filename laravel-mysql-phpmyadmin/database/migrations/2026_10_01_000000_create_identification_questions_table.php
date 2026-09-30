<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('identification_questions', function (Blueprint $table) {
            $table->id();
            $table->text('question');
            $table->string('answer');
            $table->text('acceptable_answers')->nullable();
            $table->string('category')->default('Docker Core');
            $table->string('hint')->nullable();
            $table->text('explanation')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('identification_questions');
    }
};
