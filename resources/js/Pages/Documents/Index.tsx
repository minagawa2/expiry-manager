import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DocumentDetailModal from '@/Pages/Documents/DocumentDetailModal';
import DocumentFormModal from '@/Pages/Documents/DocumentFormModal';
import PersonManagerModal from '@/Pages/People/PersonManagerModal';
import {
    categoryBadgeColors,
    personBadgeColor,
    pillBadgeProps,
    statusBadgeColors,
} from '@/constants/documentBadges';
import { documentStatusLabels } from '@/constants/documentStatusLabels';
import {
    Document,
    DocumentCategoryOption,
    DocumentStatus,
    PageProps,
    Person,
} from '@/types';
import { Head } from '@inertiajs/react';
import {
    Badge,
    Button,
    Group,
    Select,
    Stack,
    Table,
    Text,
    TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useState } from 'react';

function EmptyBadge() {
    return (
        <Badge {...pillBadgeProps} color="gray" variant="outline">
            未設定
        </Badge>
    );
}

export default function Index({
    documents,
    people,
    categories,
    channelOptions,
    reminderDayOptions,
    openDocumentId,
}: PageProps<{
    documents: Document[];
    people: Pick<Person, 'id' | 'name' | 'display_order' | 'is_self'>[];
    categories: DocumentCategoryOption[];
    channelOptions: DocumentCategoryOption[];
    reminderDayOptions: number[];
    openDocumentId?: number | null;
}>) {
    const [formOpened, { open: openForm, close: closeForm }] =
        useDisclosure(false);
    const [detailOpened, { open: openDetail, close: closeDetail }] =
        useDisclosure(false);
    const [
        personManagerOpened,
        { open: openPersonManager, close: closePersonManager },
    ] = useDisclosure(false);
    const [editingDocument, setEditingDocument] = useState<Document | null>(
        null,
    );
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(
        null,
    );

    const openCreate = () => {
        setEditingDocument(null);
        openForm();
    };

    const openRow = (document: Document) => {
        setSelectedDocument(document);
        openDetail();
    };

    const openEditFromDetail = (document: Document) => {
        closeDetail();
        setEditingDocument(document);
        openForm();
    };

    useEffect(() => {
        if (!openDocumentId) {
            return;
        }

        const target = documents.find(
            (document) => document.id === openDocumentId,
        );

        if (target) {
            setSelectedDocument(target);
            openDetail();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openDocumentId]);

    const categoryLabel = (value: string | null) => {
        if (!value) {
            return null;
        }

        return (
            categories.find((category) => category.value === value)?.label ??
            value
        );
    };

    const renderPersonBadge = (document: Document) => {
        if (!document.person?.name) {
            return <EmptyBadge />;
        }

        const isSelf = Boolean(document.person.is_self);

        return (
            <Badge {...pillBadgeProps} color={personBadgeColor(isSelf)}>
                {isSelf
                    ? `${document.person.name}（本人）`
                    : document.person.name}
            </Badge>
        );
    };

    const renderCategoryBadge = (value: string | null) => {
        const label = categoryLabel(value);

        if (!label) {
            return <EmptyBadge />;
        }

        return (
            <Badge
                {...pillBadgeProps}
                color={categoryBadgeColors[value ?? ''] ?? 'gray'}
            >
                {label}
            </Badge>
        );
    };

    const renderTypeText = (value: string | null) => {
        if (!value) {
            return (
                <Text size="sm" c="dimmed">
                    —
                </Text>
            );
        }

        return <Text size="sm">{value}</Text>;
    };

    const renderStatusBadge = (status: DocumentStatus) => {
        return (
            <Badge
                {...pillBadgeProps}
                color={statusBadgeColors[status] ?? 'gray'}
            >
                {documentStatusLabels[status] ?? status}
            </Badge>
        );
    };

    const [personFilter, setPersonFilter] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [keyword, setKeyword] = useState('');

    const personFilterOptions = people.map((person) => ({
        value: String(person.id),
        label: person.is_self ? `${person.name}（本人）` : person.name,
    }));

    const statusFilterOptions = (
        Object.keys(documentStatusLabels) as DocumentStatus[]
    ).map((status) => ({
        value: status,
        label: documentStatusLabels[status],
    }));

    const normalizedKeyword = keyword.trim().toLowerCase();

    const filteredDocuments = documents.filter((document) => {
        if (personFilter && String(document.person_id) !== personFilter) {
            return false;
        }

        if (statusFilter && document.status !== statusFilter) {
            return false;
        }

        if (normalizedKeyword) {
            const haystack = [document.title, document.type ?? '', document.memo ?? '']
                .join(' ')
                .toLowerCase();

            if (!haystack.includes(normalizedKeyword)) {
                return false;
            }
        }

        return true;
    });

    const isFiltering =
        personFilter !== null || statusFilter !== null || keyword !== '';

    const clearFilters = () => {
        setPersonFilter(null);
        setStatusFilter(null);
        setKeyword('');
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
                                <Button onClick={openCreate}>書類を追加</Button>
                                <Button
                                    onClick={openPersonManager}
                                    variant="default"
                                >
                                    対象者管理
                                </Button>
                            </Group>
                        </Group>

                        {documents.length > 0 && (
                            <Group gap="sm" align="flex-end">
                                <Select
                                    label="対象者"
                                    placeholder="すべて"
                                    data={personFilterOptions}
                                    value={personFilter}
                                    onChange={setPersonFilter}
                                    clearable
                                    searchable
                                    w={180}
                                />
                                <Select
                                    label="状態"
                                    placeholder="すべて"
                                    data={statusFilterOptions}
                                    value={statusFilter}
                                    onChange={setStatusFilter}
                                    clearable
                                    w={150}
                                />
                                <TextInput
                                    label="キーワード"
                                    placeholder="タイトル・種別・メモ"
                                    value={keyword}
                                    onChange={(event) =>
                                        setKeyword(event.currentTarget.value)
                                    }
                                    w={220}
                                />
                                {isFiltering && (
                                    <Button
                                        variant="subtle"
                                        color="gray"
                                        onClick={clearFilters}
                                    >
                                        クリア
                                    </Button>
                                )}
                            </Group>
                        )}

                        {documents.length === 0 ? (
                            <Stack gap="sm">
                                <Text c="dimmed">
                                    登録されている書類はありません。
                                </Text>
                                <Group gap="xs">
                                    <Text size="sm" c="dimmed">
                                        表示イメージ:
                                    </Text>
                                    <Badge {...pillBadgeProps} color="blue">
                                        山田花子（本人）
                                    </Badge>
                                    <Badge
                                        {...pillBadgeProps}
                                        color="violet"
                                    >
                                        資格
                                    </Badge>
                                    <Text size="sm">1級土木</Text>
                                    <Badge {...pillBadgeProps} color="green">
                                        有効
                                    </Badge>
                                </Group>
                            </Stack>
                        ) : filteredDocuments.length === 0 ? (
                            <Stack gap="sm" align="flex-start">
                                <Text c="dimmed">
                                    条件に一致する書類がありません。
                                </Text>
                                <Button
                                    variant="light"
                                    onClick={clearFilters}
                                >
                                    絞り込みをクリア
                                </Button>
                            </Stack>
                        ) : (
                            <Table
                                striped
                                highlightOnHover
                                withTableBorder
                                styles={{
                                    table: {
                                        minWidth: 640,
                                    },
                                    thead: {
                                        backgroundColor:
                                            'var(--mantine-color-blue-1)',
                                    },
                                    th: {
                                        color: 'var(--mantine-color-blue-9)',
                                        fontWeight: 600,
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
                                    {filteredDocuments.map((document) => (
                                        <Table.Tr
                                            key={document.id}
                                            onClick={() => openRow(document)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <Table.Td fw={500}>
                                                {document.title}
                                            </Table.Td>
                                            <Table.Td>
                                                {renderPersonBadge(document)}
                                            </Table.Td>
                                            <Table.Td>
                                                {renderCategoryBadge(
                                                    document.category,
                                                )}
                                            </Table.Td>
                                            <Table.Td>
                                                {renderTypeText(document.type)}
                                            </Table.Td>
                                            <Table.Td>
                                                {document.expiry_date ? (
                                                    <Text size="sm">
                                                        {new Date(
                                                            document.expiry_date,
                                                        ).toLocaleDateString(
                                                            'ja-JP',
                                                        )}
                                                    </Text>
                                                ) : (
                                                    <Text size="sm" c="dimmed">
                                                        —
                                                    </Text>
                                                )}
                                            </Table.Td>
                                            <Table.Td>
                                                {renderStatusBadge(
                                                    document.status,
                                                )}
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        )}
                    </Stack>
                </div>
            </div>

            <DocumentDetailModal
                opened={detailOpened}
                onClose={closeDetail}
                document={selectedDocument}
                categories={categories}
                channelOptions={channelOptions}
                onEdit={openEditFromDetail}
            />

            <DocumentFormModal
                opened={formOpened}
                onClose={closeForm}
                people={people}
                categories={categories}
                channelOptions={channelOptions}
                reminderDayOptions={reminderDayOptions}
                document={editingDocument}
            />

            <PersonManagerModal
                opened={personManagerOpened}
                onClose={closePersonManager}
                people={people}
            />
        </AuthenticatedLayout>
    );
}
