import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DocumentFormModal from '@/Pages/Documents/DocumentFormModal';
import { documentStatusLabels } from '@/constants/documentStatusLabels';
import {
    Document,
    DocumentCategoryOption,
    PageProps,
    Person,
} from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Button, Group, Stack, Table, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

export default function Index({
    documents,
    people,
    categories,
}: PageProps<{
    documents: Document[];
    people: Pick<Person, 'id' | 'name' | 'display_order' | 'is_self'>[];
    categories: DocumentCategoryOption[];
}>) {
    const [formOpened, { open: openForm, close: closeForm }] =
        useDisclosure(false);

    const categoryLabel = (value: string | null) => {
        if (!value) {
            return '—';
        }

        return (
            categories.find((category) => category.value === value)?.label ??
            value
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    書類一覧
                </h2>
            }
        >
            <Head title="書類一覧" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Stack gap="md">
                        <Group justify="space-between" align="flex-start">
                            <Text c="dimmed" size="sm">
                                登録した書類の一覧です
                            </Text>
                            <Group>
                                <Button onClick={openForm}>書類を追加</Button>
                                <Button
                                    component={Link}
                                    href={route('people.index')}
                                    variant="default"
                                >
                                    対象者管理
                                </Button>
                            </Group>
                        </Group>

                        {documents.length === 0 ? (
                            <Text c="dimmed">
                                登録されている書類はありません。
                            </Text>
                        ) : (
                            <Table
                                striped
                                highlightOnHover
                                withTableBorder
                                styles={{
                                    table: {
                                        minWidth: 640,
                                    },
                                }}
                            >
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>タイトル</Table.Th>
                                        <Table.Th>対象者</Table.Th>
                                        <Table.Th>分類</Table.Th>
                                        <Table.Th>種別</Table.Th>
                                        <Table.Th>有効期限</Table.Th>
                                        <Table.Th>状態</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {documents.map((document) => (
                                        <Table.Tr key={document.id}>
                                            <Table.Td>{document.title}</Table.Td>
                                            <Table.Td>
                                                {document.person?.name ?? '—'}
                                            </Table.Td>
                                            <Table.Td>
                                                {categoryLabel(
                                                    document.category,
                                                )}
                                            </Table.Td>
                                            <Table.Td>
                                                {document.type ?? '—'}
                                            </Table.Td>
                                            <Table.Td>
                                                {document.expiry_date
                                                    ? new Date(
                                                          document.expiry_date,
                                                      ).toLocaleDateString(
                                                          'ja-JP',
                                                      )
                                                    : '—'}
                                            </Table.Td>
                                            <Table.Td>
                                                {documentStatusLabels[
                                                    document.status
                                                ] ?? document.status}
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        )}
                    </Stack>
                </div>
            </div>

            <DocumentFormModal
                opened={formOpened}
                onClose={closeForm}
                people={people}
                categories={categories}
            />
        </AuthenticatedLayout>
    );
}
