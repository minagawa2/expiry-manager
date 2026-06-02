<?php

namespace App\Enums;

enum DocumentStatus: string
{
    case Active = 'active';
    case ExpiringSoon = 'expiring_soon';
    case Expired = 'expired';
    case RenewalPending = 'renewal_pending';
    case Renewed = 'renewed';
}
