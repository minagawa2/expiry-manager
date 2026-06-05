<?php

namespace App\Http\Controllers;

use App\Enums\DocumentStatus;
use App\Models\Document;
use App\Models\User;
use App\Support\DocumentStatusResolver;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    private const LIST_LIMIT = 5;

    public function index(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user instanceof User, 403);

        $documents = Document::query()
            ->where('user_id', $user->id)
            ->with('person:id,name,is_self')
            ->whereNotNull('expiry_date')
            ->orderBy('expiry_date')
            ->get();

        $today = Carbon::today();

        $expired = collect();
        $expiringSoon = collect();
        $renewalPending = collect();

        foreach ($documents as $document) {
            /** @var Carbon $expiryDate */
            $expiryDate = $document->expiry_date;
            $status = DocumentStatusResolver::resolve($document->status, $expiryDate);

            $document->status = $status;
            $document->setAttribute(
                'days_remaining',
                $today->diffInDays($expiryDate->copy()->startOfDay(), false),
            );

            if ($status === DocumentStatus::RenewalPending) {
                $renewalPending->push($document);
            } elseif ($status === DocumentStatus::Expired) {
                $expired->push($document);
            } elseif ($status === DocumentStatus::ExpiringSoon) {
                $expiringSoon->push($document);
            }
        }

        $totalCount = Document::query()
            ->where('user_id', $user->id)
            ->count();

        return Inertia::render('Dashboard', [
            'summary' => [
                'total' => $totalCount,
                'expired' => $expired->count(),
                'expiringSoon' => $expiringSoon->count(),
                'renewalPending' => $renewalPending->count(),
                'active' => $totalCount
                    - $expired->count()
                    - $expiringSoon->count()
                    - $renewalPending->count(),
            ],
            'expired' => $expired->take(self::LIST_LIMIT)->values(),
            'expiringSoon' => $expiringSoon->take(self::LIST_LIMIT)->values(),
            'renewalPending' => $renewalPending->take(self::LIST_LIMIT)->values(),
        ]);
    }
}
