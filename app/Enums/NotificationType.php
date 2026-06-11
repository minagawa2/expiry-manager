<?php

namespace App\Enums;

enum NotificationType: string
{
    case Advance = 'advance';
    case Final = 'final';
    case PostExpiry = 'post_expiry';
}
