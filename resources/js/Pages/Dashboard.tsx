import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    personBadgeColor,
    pillBadgeProps,
    statusBadgeColors,
} from '@/constants/documentBadges';
import { documentStatusLabels } from '@/constants/documentStatusLabels';
import { Document, PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    Badge,
    Button,
    Card,
    Group,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    Title,
} from '@mantine/core';

type Summary = {
    total: number;
    expired: number;
    expiringSoon: number;
    renewalPending: number;
    active: number;
};

type DashboardProps = PageProps<{
    summary: Summary;
    expired: Document[];
    expiringSoon: Document[];
    renewalPending: Document[];
}>;

function SummaryCard({
    label,
    count,
    color,
}: {
    label: string;
    count: number;
    color: string;
}) {
    return (
        <Paper withBorder radius="md" p="md">
            <Text size="sm" c="dimmed">
                {label}
            </Text>
            <Text fw={700} fz={32} c={count > 0 ? color : undefined}>
                {count}
                <Text component="span" size="sm" c="dimmed" ml={4}>
                    件
                </Text>
            </Text>
        </Paper>
    );
}

function remainingText(days?: number) {
    if (days === undefined) {
        return null;
    }

    if (days < 0) {
        return (
            <Text size="sm" c="red" fw={500}>
                {Math.abs(days)}日超過
            </Text>
        );
    }

    if (days === 0) {
        return (
            <Text size="sm" c="orange" fw={500}>
                本日まで
            </Text>
        );
    }

    return (
        <Text size="sm" c="orange" fw={500}>
            あと{days}日
        </Text>
    );
}

function DocumentRow({ document }: { document: Document }) {
    const isSelf = Boolean(document.person?.is_self);

    return (
        <Paper
            withBorder
            radius="md"
            p="sm"
            component={Link}
            href={route('documents.index', { open: document.id })}
            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
        >
            <Group justify="space-between" wrap="nowrap" align="flex-start">
                <Stack gap={4} style={{ minWidth: 0 }}>
                    <Text fw={500} truncate>
                        {document.title}
                    </Text>
                    <Group gap="xs">
                        {document.person?.name && (
                            <Badge
                                {...pillBadgeProps}
                                size="sm"
                                color={personBadgeColor(isSelf)}
                            >
                                {isSelf
                                    ? `${document.person.name}（本人）`
                                    : document.person.name}
                            </Badge>
                        )}
                        <Badge
                            {...pillBadgeProps}
                            size="sm"
                            color={statusBadgeColors[document.status] ?? 'gray'}
                        >
                            {documentStatusLabels[document.status] ??
                                document.status}
                        </Badge>
                    </Group>
                </Stack>
                <Stack gap={2} align="flex-end" style={{ flexShrink: 0 }}>
                    {document.expiry_date && (
                        <Text size="sm">
                            {new Date(
                                document.expiry_date,
                            ).toLocaleDateString('ja-JP')}
                        </Text>
                    )}
                    {remainingText(document.days_remaining)}
                </Stack>
            </Group>
        </Paper>
    );
}

function DocumentSection({
    title,
    accent,
    documents,
    emptyText,
}: {
    title: string;
    accent: string;
    documents: Document[];
    emptyText: string;
}) {
    return (
        <Card withBorder radius="md" padding="md">
            <Group gap="xs" mb="sm">
                <Title order={4}>{title}</Title>
                <Badge color={accent} variant="light" radius="xl">
                    {documents.length}
                </Badge>
            </Group>

            {documents.length === 0 ? (
                <Text c="dimmed" size="sm">
                    {emptyText}
                </Text>
            ) : (
                <Stack gap="xs">
                    {documents.map((document) => (
                        <DocumentRow key={document.id} document={document} />
                    ))}
                </Stack>
            )}
        </Card>
    );
}

export default function Dashboard({
    summary,
    expired,
    expiringSoon,
    renewalPending,
}: DashboardProps) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    ダッシュボード
                </h2>
            }
        >
            <Head title="ダッシュボード" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Stack gap="lg">
                        <Group justify="space-between" align="center">
                            <Text c="dimmed" size="sm">
                                期限が近い書類・期限切れの書類をまとめて確認できます
                            </Text>
                            <Button
                                component={Link}
                                href={route('documents.index')}
                            >
                                書類一覧へ
                            </Button>
                        </Group>

                        <SimpleGrid cols={{ base: 2, sm: 5 }}>
                            <SummaryCard
                                label="期限切れ"
                                count={summary.expired}
                                color="red"
                            />
                            <SummaryCard
                                label="期限間近（90日以内）"
                                count={summary.expiringSoon}
                                color="orange"
                            />
                            <SummaryCard
                                label="更新確認待ち"
                                count={summary.renewalPending}
                                color="yellow"
                            />
                            <SummaryCard
                                label="有効"
                                count={summary.active}
                                color="green"
                            />
                            <SummaryCard
                                label="全書類"
                                count={summary.total}
                                color="blue"
                            />
                        </SimpleGrid>

                        <SimpleGrid cols={{ base: 1, md: 2 }}>
                            <DocumentSection
                                title="期限切れ"
                                accent="red"
                                documents={expired}
                                emptyText="期限切れの書類はありません。"
                            />
                            <DocumentSection
                                title="期限間近"
                                accent="orange"
                                documents={expiringSoon}
                                emptyText="期限が近い書類はありません。"
                            />
                            <DocumentSection
                                title="更新確認待ち"
                                accent="yellow"
                                documents={renewalPending}
                                emptyText="更新確認待ちの書類はありません。"
                            />
                        </SimpleGrid>
                    </Stack>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
