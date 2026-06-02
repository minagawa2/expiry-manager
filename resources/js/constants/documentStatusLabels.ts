import { DocumentStatus } from '@/types';

export const documentStatusLabels: Record<DocumentStatus, string> = {
    active: '有効',
    expiring_soon: '期限間近',
    expired: '期限切れ',
    renewal_pending: '更新確認待ち',
    renewed: '更新済み',
};
