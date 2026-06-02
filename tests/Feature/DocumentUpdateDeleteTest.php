<?php

namespace Tests\Feature;

use App\Enums\DocumentStatus;
use App\Models\Document;
use App\Models\Person;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DocumentUpdateDeleteTest extends TestCase
{
    use RefreshDatabase;

    private function makePerson(User $user, string $name = '山田太郎'): Person
    {
        return Person::create([
            'user_id' => $user->id,
            'name' => $name,
            'display_order' => 1,
            'created_by' => $user->id,
            'updated_by' => $user->id,
        ]);
    }

    private function makeDocument(User $user, Person $person): Document
    {
        return Document::create([
            'user_id' => $user->id,
            'person_id' => $person->id,
            'title' => '元タイトル',
            'category' => 'qualification',
            'type' => '1級土木',
            'expiry_date' => now()->addYear()->toDateString(),
            'memo' => '元メモ',
            'status' => DocumentStatus::Active,
            'created_by' => $user->id,
            'updated_by' => $user->id,
        ]);
    }

    public function test_user_can_update_own_document(): void
    {
        $user = User::factory()->create();
        $person = $this->makePerson($user);
        $document = $this->makeDocument($user, $person);

        $response = $this
            ->actingAs($user)
            ->patch(route('documents.update', $document->id), [
                'person_id' => $person->id,
                'title' => '更新後タイトル',
                'category' => 'license',
                'type' => '普通自動車',
                'expiry_date' => now()->addYears(2)->toDateString(),
                'memo' => '更新後メモ',
            ]);

        $response->assertRedirect(route('documents.index'));

        $this->assertDatabaseHas('documents', [
            'id' => $document->id,
            'title' => '更新後タイトル',
            'category' => 'license',
            'type' => '普通自動車',
        ]);
    }

    public function test_user_can_delete_own_document(): void
    {
        $user = User::factory()->create();
        $person = $this->makePerson($user);
        $document = $this->makeDocument($user, $person);

        $response = $this
            ->actingAs($user)
            ->delete(route('documents.destroy', $document->id));

        $response->assertRedirect(route('documents.index'));
        $this->assertDatabaseMissing('documents', ['id' => $document->id]);
    }

    public function test_user_cannot_update_another_users_document(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $person = $this->makePerson($owner);
        $document = $this->makeDocument($owner, $person);

        $response = $this
            ->actingAs($other)
            ->patch(route('documents.update', $document->id), [
                'person_id' => $person->id,
                'title' => '乗っ取り',
            ]);

        $response->assertForbidden();
        $this->assertDatabaseHas('documents', [
            'id' => $document->id,
            'title' => '元タイトル',
        ]);
    }

    public function test_user_cannot_delete_another_users_document(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $person = $this->makePerson($owner);
        $document = $this->makeDocument($owner, $person);

        $response = $this
            ->actingAs($other)
            ->delete(route('documents.destroy', $document->id));

        $response->assertForbidden();
        $this->assertDatabaseHas('documents', ['id' => $document->id]);
    }
}
