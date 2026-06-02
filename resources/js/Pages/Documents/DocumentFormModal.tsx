import { Document, DocumentCategoryOption, Person } from '@/types';
import { useForm } from '@inertiajs/react';
import {
    Button,
    Group,
    Modal,
    Select,
    Stack,
    Textarea,
    TextInput,
} from '@mantine/core';
import { FormEvent, useEffect } from 'react';

type Props = {
    opened: boolean;
    onClose: () => void;
    people: Pick<Person, 'id' | 'name' | 'is_self'>[];
    categories: DocumentCategoryOption[];
    document?: Document | null;
};

const emptyForm = {
    person_id: '',
    title: '',
    category: '',
    type: '',
    expiry_date: '',
    memo: '',
};

function isSelfPerson(person: Pick<Person, 'is_self'>): boolean {
    return Boolean(person.is_self);
}

function defaultPersonId(people: Pick<Person, 'id' | 'is_self'>[]): string {
    const self = people.find((person) => isSelfPerson(person));

    if (self) {
        return String(self.id);
    }

    if (people.length === 1) {
        return String(people[0].id);
    }

    return '';
}

export default function DocumentFormModal({
    opened,
    onClose,
    people,
    categories,
    document = null,
}: Props) {
    const isEdit = document !== null;

    const { data, setData, post, patch, processing, errors, reset, clearErrors } =
        useForm(emptyForm);

    const personOptions = people.map((person) => ({
        value: String(person.id),
        label: isSelfPerson(person) ? `${person.name}（本人）` : person.name,
    }));

    const categoryOptions = categories.map((category) => ({
        value: category.value,
        label: category.label,
    }));

    useEffect(() => {
        if (!opened) {
            return;
        }

        reset();
        clearErrors();

        if (document) {
            setData({
                person_id: String(document.person_id),
                title: document.title,
                category: document.category ?? '',
                type: document.type ?? '',
                expiry_date: document.expiry_date
                    ? document.expiry_date.slice(0, 10)
                    : '',
                memo: document.memo ?? '',
            });
        } else {
            setData({
                ...emptyForm,
                person_id: defaultPersonId(people),
            });
        }
    }, [opened, document, people]);

    const handleClose = () => {
        reset();
        clearErrors();
        onClose();
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (isEdit && document) {
            patch(route('documents.update', document.id), {
                preserveScroll: true,
                onSuccess: handleClose,
            });

            return;
        }

        post(route('documents.store'), {
            preserveScroll: true,
            onSuccess: handleClose,
        });
    };

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title={isEdit ? '書類を編集' : '書類を登録'}
            size="lg"
        >
            <form onSubmit={submit}>
                <Stack gap="md">
                    <Select
                        label="対象者"
                        placeholder="選択してください"
                        data={personOptions}
                        value={data.person_id}
                        onChange={(value) =>
                            setData('person_id', value ?? '')
                        }
                        error={errors.person_id}
                        required
                        searchable
                        description="登録時のお名前が「（本人）」として表示されます。家族の書類は別の対象者を選択してください。"
                    />

                    <TextInput
                        label="タイトル"
                        placeholder="例: 施工管理技士（土木）"
                        value={data.title}
                        onChange={(event) =>
                            setData('title', event.currentTarget.value)
                        }
                        error={errors.title}
                        required
                    />

                    <Select
                        label="分類"
                        placeholder="選択してください"
                        data={categoryOptions}
                        value={data.category}
                        onChange={(value) =>
                            setData('category', value ?? '')
                        }
                        error={errors.category}
                        clearable
                    />

                    <TextInput
                        label="種別"
                        placeholder="例: 1級土木、普通自動車免許"
                        description="資格名・免許の詳細など（任意）"
                        value={data.type}
                        onChange={(event) =>
                            setData('type', event.currentTarget.value)
                        }
                        error={errors.type}
                    />

                    <TextInput
                        label="有効期限"
                        type="date"
                        value={data.expiry_date}
                        onChange={(event) =>
                            setData(
                                'expiry_date',
                                event.currentTarget.value,
                            )
                        }
                        error={errors.expiry_date}
                    />

                    <Textarea
                        label="メモ"
                        value={data.memo}
                        onChange={(event) =>
                            setData('memo', event.currentTarget.value)
                        }
                        error={errors.memo}
                        minRows={2}
                        autosize
                    />

                    <Group justify="flex-end">
                        <Button
                            variant="default"
                            onClick={handleClose}
                            type="button"
                        >
                            キャンセル
                        </Button>
                        <Button type="submit" loading={processing}>
                            {isEdit ? '更新' : '登録'}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
