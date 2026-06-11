<?php

namespace App\Actions;

use App\Models\Document;
use Illuminate\Support\Facades\DB;

class SyncDocumentNotificationSettings
{
    /**
     * Replace a document's reminder days and notification channels.
     *
     * @param  array<int, int|string>  $daysBefore
     * @param  array<int, string>  $channels
     */
    public function handle(Document $document, array $daysBefore, array $channels): void
    {
        $days = collect($daysBefore)
            ->map(fn ($value) => (int) $value)
            ->filter(fn (int $value) => $value > 0)
            ->unique()
            ->values();

        $uniqueChannels = collect($channels)
            ->map(fn ($value) => (string) $value)
            ->unique()
            ->values();

        DB::transaction(function () use ($document, $days, $uniqueChannels): void {
            $document->reminders()->delete();
            $document->channels()->delete();

            $document->reminders()->createMany(
                $days->map(fn (int $value) => ['days_before' => $value])->all(),
            );

            $document->channels()->createMany(
                $uniqueChannels->map(fn (string $value) => ['channel' => $value])->all(),
            );
        });
    }
}
