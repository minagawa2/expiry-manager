<?php

namespace Tests\Feature;

use App\Models\Document;
use App\Models\Person;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class DocumentStatusUpdateTest extends TestCase
{
    use RefreshDatabase;

    private function makeExpiredDocument(User $user): Document
    {
        $person = Person::create([
            'user_id' => $user->id,
            'name' => '本人',
            'display_order' => 1,
            'is_self' => true,
            'created_by' => $user->id,
            'updated_by' => $user->id,
        ]);

        return Document::create([
            'user_id' => $user->id,
            'person_id' => $person->id,
            'title' => '期限切れ書類',
            'expiry_date' => Carbon::today()->subDays(10)->toDateString(),
            'status' => 'expired',
            'created_by' => $user->id,
            'updated_by' => $user->id,
        ]);
    }

    public function test_user_can_mark_document_as_renewal_pending(): void
    {
        $user = User::factory()->create();
        $document = $this->makeExpiredDocument($user);

        $this->actingAs($user)
            ->patch(route('documents.update-status', $document), [
                'status' => 'renewal_pending',
            ])
            ->assertRedirect();

        $this->assertSame('renewal_pending', $document->fresh()->status->value);
    }

    public function test_user_can_mark_document_as_renewed(): void
    {
        $user = User::factory()->create();
        $document = $this->makeExpiredDocument($user);

        $this->actingAs($user)
            ->patch(route('documents.update-status', $document), [
                'status' => 'renewed',
            ])
            ->assertRedirect();

        $this->assertSame('renewed', $document->fresh()->status->value);
    }

    public function test_status_update_rejects_date_driven_statuses(): void
    {
        $user = User::factory()->create();
        $document = $this->makeExpiredDocument($user);

        $this->actingAs($user)
            ->patch(route('documents.update-status', $document), [
                'status' => 'active',
            ])
            ->assertSessionHasErrors('status');
    }

    public function test_user_cannot_update_status_of_another_users_document(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $document = $this->makeExpiredDocument($owner);

        $this->actingAs($other)
            ->patch(route('documents.update-status', $document), [
                'status' => 'renewed',
            ])
            ->assertForbidden();
    }
}
