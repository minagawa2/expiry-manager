<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Document categories (MVP presets)
    |--------------------------------------------------------------------------
    |
    | Keys are stored in documents.category. Labels are for UI only.
    | Enterprise / qualification-specific types can be added via config
    | or a document_type_templates table later.
    |
    */
    'categories' => [
        'qualification' => '資格',
        'license' => '免許',
        'insurance' => '保険',
        'passport' => 'パスポート・身分証',
        'other' => 'その他',
    ],

    /*
    |--------------------------------------------------------------------------
    | Expiry notification offsets
    |--------------------------------------------------------------------------
    |
    | Offsets are expressed in days relative to a document's expiry date.
    |
    | - advance_default_days: the user-configurable "remind me N days before"
    |   list. New users are seeded with these defaults; they can add more
    |   (e.g. 30) or remove them later.
    | - final_days_before: the fixed final reminder, sent N days before expiry.
    | - post_expiry_days_after: the fixed renewal-confirmation reminder, sent N
    |   days after expiry.
    |
    */
    'notifications' => [
        'advance_default_days' => [90],
        'advance_day_options' => [180, 90, 60, 30, 7],
        'final_days_before' => 3,
        'post_expiry_days_after' => 1,
    ],

    /*
    |--------------------------------------------------------------------------
    | Notification channels
    |--------------------------------------------------------------------------
    |
    | Channels a user can pick per document. Only email is delivered for now;
    | line is reserved for a future integration.
    |
    */
    'channels' => [
        'email' => 'メール',
        'line' => 'LINE',
    ],

    'default_channels' => ['email'],

];
