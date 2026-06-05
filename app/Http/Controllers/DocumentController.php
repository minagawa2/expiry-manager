<?php

namespace App\Http\Controllers;

use App\Actions\EnsureDefaultPersonForUser;
use App\Http\Requests\StoreDocumentRequest;
use App\Http\Requests\UpdateDocumentRequest;
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
            ->with('person:id,name,is_self')
            ->orderByDesc('updated_at')
            ->orderByDesc('id')
            ->get();

        $documents->each(function (Document $document): void {
            $document->status = DocumentStatusResolver::resolve(
                $document->status,
                $document->expiry_date,
            );
        });

        $people = Person::query()
            ->where('user_id', $userId)
            ->withCount('documents')
            ->orderBy('display_order')
            ->orderBy('id')
            ->get(['id', 'name', 'display_order', 'is_self']);

        return Inertia::render('Documents/Index', [
            'documents' => $documents,
            'people' => $people,
            'categories' => $this->categoryOptions(),
            'openDocumentId' => $request->integer('open') ?: null,
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

    public function update(UpdateDocumentRequest $request, Document $document): RedirectResponse
    {
        $userId = $this->currentUserId($request);
        $this->authorizeDocument($document, $userId);

        $validated = $request->validated();

        $person = Person::query()
            ->where('user_id', $userId)
            ->findOrFail($validated['person_id']);

        $expiryDate = isset($validated['expiry_date'])
            ? $request->date('expiry_date')
            : null;

        $document->update([
            'person_id' => $person->id,
            'title' => $validated['title'],
            'category' => $validated['category'] ?? null,
            'type' => $validated['type'] ?? null,
            'expiry_date' => $expiryDate,
            'memo' => $validated['memo'] ?? null,
            'status' => DocumentStatusResolver::fromExpiryDate($expiryDate),
            'updated_by' => $userId,
        ]);

        return redirect()->route('documents.index');
    }

    public function destroy(Request $request, Document $document): RedirectResponse
    {
        $userId = $this->currentUserId($request);
        $this->authorizeDocument($document, $userId);

        $document->delete();

        return redirect()->route('documents.index');
    }

    private function authorizeDocument(Document $document, int $userId): void
    {
        abort_unless($document->user_id === $userId, 403);
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
