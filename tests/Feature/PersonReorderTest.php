<?php

namespace Tests\Feature;

use App\Models\Person;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PersonReorderTest extends TestCase
{
    use RefreshDatabase;

    private function makePerson(User $user, string $name, int $order): Person
    {
        return Person::create([
            'user_id' => $user->id,
            'name' => $name,
            'display_order' => $order,
            'created_by' => $user->id,
            'updated_by' => $user->id,
        ]);
    }

    public function test_user_can_reorder_own_people(): void
    {
        $user = User::factory()->create();
        $a = $this->makePerson($user, 'A', 1);
        $b = $this->makePerson($user, 'B', 2);
        $c = $this->makePerson($user, 'C', 3);

        $response = $this
            ->actingAs($user)
            ->patch(route('people.reorder'), [
                'ids' => [$c->id, $a->id, $b->id],
            ]);

        $response->assertRedirect();

        $this->assertSame(1, $c->fresh()->display_order);
        $this->assertSame(2, $a->fresh()->display_order);
        $this->assertSame(3, $b->fresh()->display_order);
    }

    public function test_reorder_ignores_people_of_other_users(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        $mine = $this->makePerson($user, 'Mine', 5);
        $theirs = $this->makePerson($other, 'Theirs', 9);

        $this
            ->actingAs($user)
            ->patch(route('people.reorder'), [
                'ids' => [$theirs->id, $mine->id],
            ])
            ->assertRedirect();

        // Other user's record is untouched.
        $this->assertSame(9, $theirs->fresh()->display_order);
        // Mine gets repositioned (the foreign id is skipped).
        $this->assertSame(1, $mine->fresh()->display_order);
    }
}
