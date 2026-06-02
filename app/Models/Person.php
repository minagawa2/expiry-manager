<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Person extends Model
{
    protected $fillable = [
      'user_id',
      'name',
      'display_order',
      'created_by',
      'updated_by',
    ];
}
