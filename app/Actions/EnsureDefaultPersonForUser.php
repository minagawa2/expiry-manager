<?php

namespace App\Actions;

use App\Models\Person;
use App\Models\User;

class EnsureDefaultPersonForUser
{
    /**
     * Ensure the account holder exists as a document target (本人).
     */
    public function handle(User $user): Person
    {
        $self = Person::query()
            ->where('user_id', $user->id)
            ->where('is_self', true)
            ->first();

        if ($self !== null) {
            return $self;
        }

        $minOrder = Person::query()
            ->where('user_id', $user->id)
            ->min('display_order');

        $displayOrder = $minOrder !== null ? min(0, $minOrder - 1) : 1;

        return Person::create([
            'user_id' => $user->id,
            'name' => $user->name,
            'display_order' => $displayOrder,
            'is_self' => true,
            'created_by' => $user->id,
            'updated_by' => $user->id,
        ]);
    }
}
