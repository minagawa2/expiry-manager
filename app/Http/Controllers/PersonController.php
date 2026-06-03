<?php

namespace App\Http\Controllers;

use App\Models\Person;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PersonController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $userId = $this->currentUserId($request);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $maxOrder = Person::query()
            ->where('user_id', $userId)
            ->max('display_order');

        Person::create([
            'user_id' => $userId,
            'name' => $validated['name'],
            'display_order' => ($maxOrder ?? 0) + 1,
            'created_by' => $userId,
            'updated_by' => $userId,
        ]);

        return back();
    }

    public function update(Request $request, Person $person): RedirectResponse
    {
        $userId = $this->currentUserId($request);
        $this->authorizePerson($person, $userId);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $person->update([
            'name' => $validated['name'],
            'updated_by' => $userId,
        ]);

        return back();
    }

    public function destroy(Request $request, Person $person): RedirectResponse
    {
        $userId = $this->currentUserId($request);
        $this->authorizePerson($person, $userId);

        $person->delete();

        return back();
    }

    public function reorder(Request $request): RedirectResponse
    {
        $userId = $this->currentUserId($request);

        $validated = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer'],
        ]);

        $ownedIds = Person::query()
            ->where('user_id', $userId)
            ->pluck('id')
            ->all();

        $position = 1;

        foreach ($validated['ids'] as $id) {
            if (! in_array($id, $ownedIds, true)) {
                continue;
            }

            Person::query()
                ->where('user_id', $userId)
                ->where('id', $id)
                ->update([
                    'display_order' => $position,
                    'updated_by' => $userId,
                ]);

            $position++;
        }

        return back();
    }

    private function currentUserId(Request $request): int
    {
        $user = $request->user();

        abort_unless($user instanceof User, 403);

        return $user->id;
    }

    private function authorizePerson(Person $person, int $userId): void
    {
        abort_unless($person->user_id === $userId, 403);
    }
}
