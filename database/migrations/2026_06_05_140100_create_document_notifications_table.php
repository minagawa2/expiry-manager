<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained()->cascadeOnDelete();
            $table->string('channel');
            $table->string('type');
            $table->smallInteger('offset_days');
            $table->timestamp('sent_at');
            $table->timestamps();

            $table->unique(['document_id', 'channel', 'offset_days']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_notifications');
    }
};
