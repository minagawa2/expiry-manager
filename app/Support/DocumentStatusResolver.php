<?php

namespace App\Support;

use App\Enums\DocumentStatus;
use Carbon\CarbonInterface;

class DocumentStatusResolver
{
    /**
     * Resolve the status to display.
     *
     * Manual states (renewal pending / renewed) are kept as-is; otherwise the
     * status is derived live from the expiry date so the list never shows a
     * stale value.
     */
    public static function resolve(DocumentStatus $current, ?CarbonInterface $expiryDate): DocumentStatus
    {
        if (in_array($current, [DocumentStatus::RenewalPending, DocumentStatus::Renewed], true)) {
            return $current;
        }

        return self::fromExpiryDate($expiryDate);
    }

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
