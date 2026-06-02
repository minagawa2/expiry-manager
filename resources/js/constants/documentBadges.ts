import { DocumentStatus } from '@/types';

export const categoryBadgeColors: Record<string, string> = {
    qualification: 'violet',
    license: 'blue',
    insurance: 'teal',
    passport: 'orange',
    other: 'gray',
};

export const personBadgeColor = (isSelf: boolean): string =>
    isSelf ? 'blue' : 'teal';

export const statusBadgeColors: Record<DocumentStatus, string> = {
    active: 'green',
    expiring_soon: 'orange',
    expired: 'red',
    renewal_pending: 'yellow',
    renewed: 'cyan',
};

export const pillBadgeProps = {
    radius: 'xl' as const,
    variant: 'light' as const,
    size: 'md' as const,
    tt: 'none' as const,
};
