<?php

namespace App\Models;

use App\Enums\NotificationChannel;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentChannel extends Model
{
    protected $fillable = [
        'document_id',
        'channel',
    ];

    protected function casts(): array
    {
        return [
            'channel' => NotificationChannel::class,
        ];
    }

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }
}
