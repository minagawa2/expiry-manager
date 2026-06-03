import { Person } from '@/types';
import { useForm } from '@inertiajs/react';
import { Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { FormEvent, useEffect } from 'react';

type Props = {
    opened: boolean;
    onClose: () => void;
    person: Person | null;
    zIndex?: number;
};

export default function PersonFormModal({
    opened,
    onClose,
    person,
    zIndex,
}: Props) {
    const isEdit = person !== null;

    const { data, setData, post, patch, processing, errors, reset, clearErrors } =
        useForm({
            name: '',
        });

    useEffect(() => {
        if (!opened) {
            return;
        }

        setData('name', person?.name ?? '');
        clearErrors();
    }, [opened, person]);

    const handleClose = () => {
        reset();
        clearErrors();
        onClose();
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (isEdit && person) {
            patch(route('people.update', person.id), {
                preserveScroll: true,
                onSuccess: handleClose,
            });

            return;
        }

        post(route('people.store'), {
            preserveScroll: true,
            onSuccess: handleClose,
        });
    };

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title={isEdit ? '対象者を編集' : '対象者を追加'}
            zIndex={zIndex}
        >
            <form onSubmit={submit}>
                <Stack gap="md">
                    <TextInput
                        label="名前"
                        value={data.name}
                        onChange={(event) =>
                            setData('name', event.currentTarget.value)
                        }
                        error={errors.name}
                        required
                        data-autofocus
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
