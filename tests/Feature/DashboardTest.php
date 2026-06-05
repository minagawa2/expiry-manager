<?php

namespace Tests\Feature;

use App\Models\Document;
use App\Models\Person;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    private function makeDocument(User $user, Person $person, ?string $expiryDate): Document
    {
        return Document::create([
            'user_id' => $user->id,
            'person_id' => $person->id,
            'title' => 'Doc '.($expiryDate ?? 'none'),
            'expiry_date' => $expiryDate,
            'status' => 'active',
            'created_by' => $user->id,
            'updated_by' => $user->id,
        ]);
    }

    public function test_dashboard_groups_documents_by_live_expiry_status(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $person = Person::create([
            'user_id' => $user->id,
            'name' => '本人',
            'display_order' => 1,
            'is_self' => true,
            'created_by' => $user->id,
            'updated_by' => $user->id,
        ]);

        $this->makeDocument($user, $person, Carbon::today()->subDays(5)->toDateString());
        $this->makeDocument($user, $person, Carbon::today()->addDays(10)->toDateString());
        $this->makeDocument($user, $person, Carbon::today()->addDays(400)->toDateString());

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Dashboard')
                ->where('summary.total', 3)
                ->where('summary.expired', 1)
                ->where('summary.expiringSoon', 1)
                ->where('summary.active', 1)
                ->has('expired', 1)
                ->has('expiringSoon', 1)
            );
    }
}
