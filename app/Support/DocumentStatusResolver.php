<?php

namespace App\Support;

use App\Enums\DocumentStatus;
use Carbon\CarbonInterface;

class DocumentStatusResolver
{
    public static function fromExpiryDate(?CarbonInterface $expiryDate): DocumentStatus
    {
        if ($expiryDate === null) {
            return DocumentStatus::Active;
        }

        if ($expiryDate->isPast()) {
            return DocumentStatus::Expired;
        }

        if ($expiryDate->lte(now()->addDays(90)->startOfDay())) {
            return DocumentStatus::ExpiringSoon;
        }

        return DocumentStatus::Active;
    }
}
