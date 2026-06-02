<?php

namespace Tests\Feature;

use App\Enums\DocumentStatus;
use App\Models\Person;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DocumentStoreTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_store_document(): void
    {
        $user = User::factory()->create();
        $person = Person::create([
            'user_id' => $user->id,
            'name' => '山田太郎',
            'display_order' => 1,
            'created_by' => $user->id,
            'updated_by' => $user->id,
        ]);

        $response = $this
            ->actingAs($user)
            ->post(route('documents.store'), [
                'person_id' => $person->id,
                'title' => '施工管理技士',
                'category' => 'qualification',
                'type' => '1級土木',
                'expiry_date' => now()->addYear()->toDateString(),
                'memo' => '更新注意',
            ]);

        $response->assertRedirect(route('documents.index'));

        $this->assertDatabaseHas('documents', [
            'user_id' => $user->id,
            'person_id' => $person->id,
            'title' => '施工管理技士',
            'category' => 'qualification',
            'type' => '1級土木',
            'status' => DocumentStatus::Active->value,
        ]);
    }

    public function test_user_cannot_store_document_for_another_users_person(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $person = Person::create([
            'user_id' => $owner->id,
            'name' => '他人の対象者',
            'display_order' => 1,
            'created_by' => $owner->id,
            'updated_by' => $owner->id,
        ]);

        $response = $this
            ->actingAs($other)
            ->post(route('documents.store'), [
                'person_id' => $person->id,
                'title' => '不正登録',
            ]);

        $response->assertNotFound();
    }
}
