import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PersonFormModal from '@/Pages/People/PersonFormModal';
import { PageProps, Person } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    Button,
    Group,
    Stack,
    Table,
    Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';

export default function Index({
    people,
}: PageProps<{ people: Person[] }>) {
    const [formOpened, { open: openForm, close: closeForm }] =
        useDisclosure(false);
    const [editingPerson, setEditingPerson] = useState<Person | null>(null);

    const openCreate = () => {
        setEditingPerson(null);
        openForm();
    };

    const openEdit = (person: Person) => {
        setEditingPerson(person);
        openForm();
    };

    const handleDelete = (person: Person) => {
        if (!window.confirm(`「${person.name}」を削除しますか？`)) {
            return;
        }

        router.delete(route('people.destroy', person.id), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    対象者一覧
                </h2>
            }
        >
            <Head title="対象者一覧" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Stack gap="md">
                        <Group justify="space-between">
                            <Text c="dimmed" size="sm">
                                書類の対象となる方の一覧です
                            </Text>
                            <Button onClick={openCreate}>対象者を追加</Button>
                        </Group>

                        {people.length === 0 ? (
                            <Text c="dimmed">登録されている対象者はいません。</Text>
                        ) : (
                            <Table striped highlightOnHover withTableBorder>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>名前</Table.Th>
                                        <Table.Th w={160}>操作</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {people.map((person) => (
                                        <Table.Tr key={person.id}>
                                            <Table.Td>{person.name}</Table.Td>
                                            <Table.Td>
                                                <Group gap="xs">
                                                    <Button
                                                        size="compact-sm"
                                                        variant="light"
                                                        onClick={() =>
                                                            openEdit(person)
                                                        }
                                                    >
                                                        編集
                                                    </Button>
                                                    <Button
                                                        size="compact-sm"
                                                        variant="light"
                                                        color="red"
                                                        onClick={() =>
                                                            handleDelete(person)
                                                        }
                                                    >
                                                        削除
                                                    </Button>
                                                </Group>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        )}
                    </Stack>
                </div>
            </div>

            <PersonFormModal
                opened={formOpened}
                onClose={closeForm}
                person={editingPerson}
            />
        </AuthenticatedLayout>
    );
}
