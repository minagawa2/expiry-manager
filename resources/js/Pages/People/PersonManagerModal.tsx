import PersonFormModal from '@/Pages/People/PersonFormModal';
import SortablePersonRow from '@/Pages/People/SortablePersonRow';
import { Person } from '@/types';
import { router } from '@inertiajs/react';
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useState } from 'react';

type ManagedPerson = Pick<
    Person,
    'id' | 'name' | 'is_self' | 'documents_count'
>;

type Props = {
    opened: boolean;
    onClose: () => void;
    people: ManagedPerson[];
};

export default function PersonManagerModal({
    opened,
    onClose,
    people,
}: Props) {
    const [items, setItems] = useState<ManagedPerson[]>(people);
    const [formOpened, { open: openForm, close: closeForm }] =
        useDisclosure(false);
    const [editingPerson, setEditingPerson] = useState<Person | null>(null);

    useEffect(() => {
        setItems(people);
    }, [people]);

    const sensors = useSensors(useSensor(PointerSensor));

    const persistOrder = (ordered: ManagedPerson[]) => {
        router.patch(
            route('people.reorder'),
            { ids: ordered.map((person) => person.id) },
            { preserveScroll: true, preserveState: true },
        );
    };

    const applyOrder = (ordered: ManagedPerson[]) => {
        setItems(ordered);
        persistOrder(ordered);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = items.findIndex((person) => person.id === active.id);
        const newIndex = items.findIndex((person) => person.id === over.id);

        if (oldIndex === -1 || newIndex === -1) {
            return;
        }

        applyOrder(arrayMove(items, oldIndex, newIndex));
    };

    const moveBy = (index: number, direction: -1 | 1) => {
        const target = index + direction;

        if (target < 0 || target >= items.length) {
            return;
        }

        applyOrder(arrayMove(items, index, target));
    };

    const openCreate = () => {
        setEditingPerson(null);
        openForm();
    };

    const openEdit = (person: ManagedPerson) => {
        setEditingPerson(person as Person);
        openForm();
    };

    const handleDelete = (person: ManagedPerson) => {
        const count = person.documents_count ?? 0;
        const message =
            count > 0
                ? `「${person.name}」を削除すると、紐づく書類 ${count} 件も削除されます。よろしいですか？`
                : `「${person.name}」を削除しますか？`;

        if (!window.confirm(message)) {
            return;
        }

        router.delete(route('people.destroy', person.id), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Modal
                opened={opened}
                onClose={onClose}
                title="対象者の管理"
                size="lg"
            >
                <Stack gap="md">
                    <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                            ドラッグまたは矢印で並び替えできます
                        </Text>
                        <Button size="compact-sm" onClick={openCreate}>
                            対象者を追加
                        </Button>
                    </Group>

                    {items.length === 0 ? (
                        <Text c="dimmed" size="sm">
                            登録されている対象者はいません。
                        </Text>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={items.map((person) => person.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <Stack gap="xs">
                                    {items.map((person, index) => (
                                        <SortablePersonRow
                                            key={person.id}
                                            person={person}
                                            index={index}
                                            total={items.length}
                                            onEdit={() => openEdit(person)}
                                            onDelete={() =>
                                                handleDelete(person)
                                            }
                                            onMoveUp={() => moveBy(index, -1)}
                                            onMoveDown={() => moveBy(index, 1)}
                                        />
                                    ))}
                                </Stack>
                            </SortableContext>
                        </DndContext>
                    )}

                    <Group justify="flex-end">
                        <Button variant="default" onClick={onClose}>
                            閉じる
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            <PersonFormModal
                opened={formOpened}
                onClose={closeForm}
                person={editingPerson}
                zIndex={300}
            />
        </>
    );
}
