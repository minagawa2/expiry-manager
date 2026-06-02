import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Button, Stack, Text } from '@mantine/core';

export default function Dashboard() {
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
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <Stack gap="md">
                                <Text>
                                    期限が近い書類や更新確認が必要な書類をここに表示します（準備中）。
                                </Text>
                                <Button
                                    component={Link}
                                    href={route('documents.index')}
                                >
                                    書類一覧へ
                                </Button>
                            </Stack>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
