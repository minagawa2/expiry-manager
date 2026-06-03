import { Person } from '@/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ActionIcon, Badge, Group, Paper, Text } from '@mantine/core';

type Props = {
    person: Pick<Person, 'id' | 'name' | 'is_self' | 'documents_count'>;
    index: number;
    total: number;
    onEdit: () => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
};

export default function SortablePersonRow({
    person,
    index,
    total,
    onEdit,
    onDelete,
    onMoveUp,
    onMoveDown,
}: Props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: person.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
    };

    const isSelf = Boolean(person.is_self);

    return (
        <Paper
            ref={setNodeRef}
            style={style}
            withBorder
            radius="md"
            p="xs"
            shadow={isDragging ? 'md' : undefined}
        >
            <Group justify="space-between" wrap="nowrap">
                <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
                    <ActionIcon
                        variant="subtle"
                        color="gray"
                        style={{ cursor: 'grab' }}
                        aria-label="ドラッグして並び替え"
                        {...attributes}
                        {...listeners}
                    >
                        ⋮⋮
                    </ActionIcon>
                    <Text size="sm" truncate>
                        {person.name}
                    </Text>
                    {isSelf && (
                        <Badge
                            size="sm"
                            radius="xl"
                            variant="light"
                            color="blue"
                            tt="none"
                        >
                            本人
                        </Badge>
                    )}
                    {(person.documents_count ?? 0) > 0 && (
                        <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
                            書類{person.documents_count}件
                        </Text>
                    )}
                </Group>

                <Group gap={4} wrap="nowrap">
                    <ActionIcon
                        variant="subtle"
                        color="gray"
                        disabled={index === 0}
                        onClick={onMoveUp}
                        aria-label="上へ"
                    >
                        ↑
                    </ActionIcon>
                    <ActionIcon
                        variant="subtle"
                        color="gray"
                        disabled={index === total - 1}
                        onClick={onMoveDown}
                        aria-label="下へ"
                    >
                        ↓
                    </ActionIcon>
                    <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={onEdit}
                        aria-label="編集"
                    >
                        ✎
                    </ActionIcon>
                    <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={onDelete}
                        disabled={isSelf}
                        aria-label="削除"
                    >
                        ×
                    </ActionIcon>
                </Group>
            </Group>
        </Paper>
    );
}
