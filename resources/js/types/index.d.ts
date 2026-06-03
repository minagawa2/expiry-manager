export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
}

export interface Person {
    id: number;
    name: string;
    display_order: number;
    is_self?: boolean;
    documents_count?: number;
}

export interface DocumentCategoryOption {
    value: string;
    label: string;
}

export type DocumentStatus =
    | 'active'
    | 'expiring_soon'
    | 'expired'
    | 'renewal_pending'
    | 'renewed';

export interface Document {
    id: number;
    person_id: number;
    category: string | null;
    type: string | null;
    title: string;
    expiry_date: string | null;
    memo: string | null;
    status: DocumentStatus;
    updated_at: string;
    person?: Pick<Person, 'id' | 'name' | 'is_self'>;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};
