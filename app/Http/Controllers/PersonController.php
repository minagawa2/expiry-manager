<?php

namespace App\Http\Controllers;

use App\Models\Person;
use Inertia\Inertia;

class PersonController extends Controller
{
    public function index()
    {
        $people = Person::orderBy('display_order')->get();

        return Inertia::render('People/Index', [
            'people' => $people,
        ]);
    }
}
