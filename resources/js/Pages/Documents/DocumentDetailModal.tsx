import {
    categoryBadgeColors,
    personBadgeColor,
    pillBadgeProps,
    statusBadgeColors,
} from '@/constants/documentBadges';
import { documentStatusLabels } from '@/constants/documentStatusLabels';
import { Document, DocumentCategoryOption, DocumentStatus } from '@/types';
import { router } from '@inertiajs/react';
import {
    Badge,
    Button,
    Divider,
    Group,
    Modal,
    Stack,
    Text,
} from '@mantine/core';
import { useState } from 'react';

type Props = {
    opened: boolean;
    onClose: () => void;
    document: Document | null;
    categories: DocumentCategoryOption[];
    channelOptions: DocumentCategoryOption[];
    onEdit: (document: Document) => void;
};

function DetailRow({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <Group justify="space-between" wrap="nowrap" align="flex-start">
            <Text size="sm" c="dimmed" w={96} style={{ flexShrink: 0 }}>
                {label}
            </Text>
            <div style={{ textAlign: 'right' }}>{children}</div>
        </Group>
    );
}

export default function DocumentDetailModal({
    opened,
    onClose,
    document,
    categories,
    channelOptions,
    onEdit,
}: Props) {
    const [deleting, setDeleting] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    if (!document) {
        return (
            <Modal opened={opened} onClose={onClose} title="書類の詳細" />
        );
    }

    const changeStatus = (status: DocumentStatus) => {
        setUpdatingStatus(true);

        router.patch(
            route('documents.update-status', document.id),
            { status },
            {
                preserveScroll: true,
                onFinish: () => setUpdatingStatus(false),
                onSuccess: onClose,
            },
        );
    };

    const showRenewalPending = document.status === 'expired';
    const showRenewed =
        document.status === 'expired' ||
        document.status === 'renewal_pending';

    const categoryLabel =
        categories.find((category) => category.value === document.category)
            ?.label ?? null;

    const isSelf = Boolean(document.person?.is_self);

    const channelLabel = (value: string) =>
        channelOptions.find((channel) => channel.value === value)?.label ??
        value;

    const reminderDays = document.reminder_days ?? [];
    const channels = document.channels ?? [];

    const handleDelete = () => {
        if (!window.confirm(`「${document.title}」を削除しますか？`)) {
            return;
        }

        setDeleting(true);

        router.delete(route('documents.destroy', document.id), {
            preserveScroll: true,
            onFinish: () => setDeleting(false),
            onSuccess: onClose,
        });
    };

    return (
        <Modal opened={opened} onClose={onClose} title="書類の詳細" size="lg">
            <Stack gap="md">
                <Text fw={600} size="lg">
                    {document.title}
                </Text>

                <Divider />

                <Stack gap={0}>
                    <DetailRow label="対象者">
                        {document.person?.name ? (
                            <Badge
                                {...pillBadgeProps}
                                color={personBadgeColor(isSelf)}
                            >
                                {isSelf
                                    ? `${document.person.name}（本人）`
                                    : document.person.name}
                            </Badge>
                        ) : (
                            <Text size="sm" c="dimmed">
                                —
                            </Text>
                        )}
                    </DetailRow>

                    <Divider my="xs" />

                    <DetailRow label="分類">
                        {categoryLabel ? (
                            <Badge
                                {...pillBadgeProps}
                                color={
                                    categoryBadgeColors[
                                        document.category ?? ''
                                    ] ?? 'gray'
                                }
                            >
                                {categoryLabel}
                            </Badge>
                        ) : (
                            <Text size="sm" c="dimmed">
                                —
                            </Text>
                        )}
                    </DetailRow>

                    <Divider my="xs" />

                    <DetailRow label="種別">
                        <Text size="sm">{document.type || '—'}</Text>
                    </DetailRow>

                    <Divider my="xs" />

                    <DetailRow label="有効期限">
                        <Text size="sm">
                            {document.expiry_date
                                ? new Date(
                                      document.expiry_date,
                                  ).toLocaleDateString('ja-JP')
                                : '—'}
                        </Text>
                    </DetailRow>

                    <Divider my="xs" />

                    <DetailRow label="状態">
                        <Badge
                            {...pillBadgeProps}
                            color={
                                statusBadgeColors[document.status] ?? 'gray'
                            }
                        >
                            {documentStatusLabels[document.status] ??
                                document.status}
                        </Badge>
                    </DetailRow>

                    <Divider my="xs" />

                    <DetailRow label="通知日">
                        {reminderDays.length > 0 ? (
                            <Text size="sm">
                                {reminderDays
                                    .map((day) => `${day}日前`)
                                    .join('、')}
                            </Text>
                        ) : (
                            <Text size="sm" c="dimmed">
                                なし
                            </Text>
                        )}
                    </DetailRow>

                    <Divider my="xs" />

                    <DetailRow label="通知手段">
                        {channels.length > 0 ? (
                            <Group gap="xs" justify="flex-end">
                                {channels.map((channel) => (
                                    <Badge
                                        key={channel}
                                        {...pillBadgeProps}
                                        variant="light"
                                        color="grape"
                                    >
                                        {channelLabel(channel)}
                                    </Badge>
                                ))}
                            </Group>
                        ) : (
                            <Text size="sm" c="dimmed">
                                なし
                            </Text>
                        )}
                    </DetailRow>

                    <Divider my="xs" />

                    <DetailRow label="メモ">
                        <Text
                            size="sm"
                            style={{ whiteSpace: 'pre-wrap' }}
                        >
                            {document.memo || '—'}
                        </Text>
                    </DetailRow>
                </Stack>

                {(showRenewalPending || showRenewed) && (
                    <>
                        <Divider />
                        <Stack gap="xs">
                            <Text size="sm" c="dimmed">
                                対応状況を記録できます（期限の通知を止めます）
                            </Text>
                            <Group>
                                {showRenewalPending && (
                                    <Button
                                        variant="light"
                                        color="yellow"
                                        onClick={() =>
                                            changeStatus('renewal_pending')
                                        }
                                        loading={updatingStatus}
                                    >
                                        更新待ちにする
                                    </Button>
                                )}
                                {showRenewed && (
                                    <Button
                                        variant="light"
                                        color="cyan"
                                        onClick={() => changeStatus('renewed')}
                                        loading={updatingStatus}
                                    >
                                        更新済みにする
                                    </Button>
                                )}
                            </Group>
                        </Stack>
                    </>
                )}

                <Divider />

                <Group justify="flex-end">
                    <Button onClick={() => onEdit(document)}>編集</Button>
                    <Button
                        variant="light"
                        color="red"
                        onClick={handleDelete}
                        loading={deleting}
                    >
                        削除
                    </Button>
                    <Button variant="default" onClick={onClose}>
                        閉じる
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
