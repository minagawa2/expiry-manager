<?php

namespace App\Http\Controllers;

use App\Actions\EnsureDefaultPersonForUser;
use App\Http\Requests\StoreDocumentRequest;
use App\Models\Document;
use App\Models\Person;
use App\Models\User;
use App\Support\DocumentStatusResolver;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DocumentController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user instanceof User, 403);

        app(EnsureDefaultPersonForUser::class)->handle($user);

        $userId = $user->id;

        $documents = Document::query()
            ->where('user_id', $userId)
            ->with('person:id,name')
            ->orderByDesc('updated_at')
            ->orderByDesc('id')
            ->get();

        $people = Person::query()
            ->where('user_id', $userId)
            ->orderBy('display_order')
            ->orderBy('id')
            ->get(['id', 'name', 'display_order', 'is_self']);

        return Inertia::render('Documents/Index', [
            'documents' => $documents,
            'people' => $people,
            'categories' => $this->categoryOptions(),
        ]);
    }

    public function store(StoreDocumentRequest $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user instanceof User, 403);

        app(EnsureDefaultPersonForUser::class)->handle($user);

        $userId = $user->id;
        $validated = $request->validated();

        $person = Person::query()
            ->where('user_id', $userId)
            ->findOrFail($validated['person_id']);

        $expiryDate = isset($validated['expiry_date'])
            ? $request->date('expiry_date')
            : null;

        Document::create([
            'user_id' => $userId,
            'person_id' => $person->id,
            'title' => $validated['title'],
            'category' => $validated['category'] ?? null,
            'type' => $validated['type'] ?? null,
            'expiry_date' => $expiryDate,
            'memo' => $validated['memo'] ?? null,
            'status' => DocumentStatusResolver::fromExpiryDate($expiryDate),
            'created_by' => $userId,
            'updated_by' => $userId,
        ]);

        return redirect()->route('documents.index');
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    private function categoryOptions(): array
    {
        return collect(config('documents.categories', []))
            ->map(fn (string $label, string $value) => [
                'value' => $value,
                'label' => $label,
            ])
            ->values()
            ->all();
    }

    private function currentUserId(Request $request): int
    {
        $user = $request->user();

        abort_unless($user instanceof User, 403);

        return $user->id;
    }
}
