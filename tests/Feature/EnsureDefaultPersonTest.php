<?php

namespace Tests\Feature;

use App\Models\Person;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EnsureDefaultPersonTest extends TestCase
{
    use RefreshDatabase;

    public function test_documents_index_creates_default_person_for_existing_user_without_people(): void
    {
        $user = User::factory()->create([
            'name' => '山田花子',
        ]);

        $this->assertDatabaseCount('people', 0);

        $this->actingAs($user)
            ->get(route('documents.index'))
            ->assertOk();

        $this->assertDatabaseHas('people', [
            'user_id' => $user->id,
            'name' => '山田花子',
            'is_self' => true,
        ]);
    }

    public function test_documents_index_creates_self_person_when_only_family_members_exist(): void
    {
        $user = User::factory()->create([
            'name' => '山田ママ',
        ]);

        Person::create([
            'user_id' => $user->id,
            'name' => '山田太郎',
            'display_order' => 1,
            'is_self' => false,
            'created_by' => $user->id,
            'updated_by' => $user->id,
        ]);

        $this->actingAs($user)
            ->get(route('documents.index'))
            ->assertOk();

        $this->assertDatabaseHas('people', [
            'user_id' => $user->id,
            'name' => '山田ママ',
            'is_self' => true,
        ]);

        $this->assertDatabaseCount('people', 2);
    }
}
