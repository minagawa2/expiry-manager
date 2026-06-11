<?php

namespace Tests\Feature;

use App\Models\Person;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReminderSeedingTest extends TestCase
{
    use RefreshDatabase;

    private function makeSelf(User $user): Person
    {
        return Person::create([
            'user_id' => $user->id,
            'name' => '本人',
            'display_order' => 1,
            'is_self' => true,
            'created_by' => $user->id,
            'updated_by' => $user->id,
        ]);
    }

    public function test_storing_a_document_uses_default_reminders_when_none_given(): void
    {
        $user = User::factory()->create();
        $person = $this->makeSelf($user);

        $this->actingAs($user)
            ->post(route('documents.store'), [
                'person_id' => $person->id,
                'title' => '運転免許証',
                'expiry_date' => now()->addDays(120)->toDateString(),
                'channels' => ['email'],
            ])
            ->assertRedirect();

        $document = $user->documents()->firstOrFail();

        $this->assertEqualsCanonicalizing(
            config('documents.notifications.advance_default_days'),
            $document->reminders()->pluck('days_before')->all(),
        );

        $this->assertEqualsCanonicalizing(
            ['email'],
            $document->channels()->pluck('channel')->map->value->all(),
        );
    }

    public function test_storing_a_document_persists_selected_days_and_channels(): void
    {
        $user = User::factory()->create();
        $person = $this->makeSelf($user);

        $this->actingAs($user)
            ->post(route('documents.store'), [
                'person_id' => $person->id,
                'title' => '運転免許証',
                'expiry_date' => now()->addDays(200)->toDateString(),
                'reminder_days' => [90, 30],
                'channels' => ['email', 'line'],
            ])
            ->assertRedirect();

        $document = $user->documents()->firstOrFail();

        $this->assertEqualsCanonicalizing(
            [90, 30],
            $document->reminders()->pluck('days_before')->all(),
        );

        $this->assertEqualsCanonicalizing(
            ['email', 'line'],
            $document->channels()->pluck('channel')->map->value->all(),
        );
    }

    public function test_storing_a_document_requires_at_least_one_channel(): void
    {
        $user = User::factory()->create();
        $person = $this->makeSelf($user);

        $this->actingAs($user)
            ->post(route('documents.store'), [
                'person_id' => $person->id,
                'title' => '運転免許証',
                'channels' => [],
            ])
            ->assertSessionHasErrors('channels');

        $this->assertSame(0, $user->documents()->count());
    }

    public function test_updating_a_document_replaces_notification_settings(): void
    {
        $user = User::factory()->create();
        $person = $this->makeSelf($user);

        $this->actingAs($user)
            ->post(route('documents.store'), [
                'person_id' => $person->id,
                'title' => '運転免許証',
                'reminder_days' => [90],
                'channels' => ['email'],
            ])
            ->assertRedirect();

        $document = $user->documents()->firstOrFail();

        $this->actingAs($user)
            ->patch(route('documents.update', $document->id), [
                'person_id' => $person->id,
                'title' => '運転免許証',
                'reminder_days' => [60, 7],
                'channels' => ['line'],
            ])
            ->assertRedirect();

        $this->assertEqualsCanonicalizing(
            [60, 7],
            $document->reminders()->pluck('days_before')->all(),
        );

        $this->assertEqualsCanonicalizing(
            ['line'],
            $document->channels()->pluck('channel')->map->value->all(),
        );
    }
}
