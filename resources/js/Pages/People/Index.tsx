import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';

type Person = {
    id: number;
    name: string;
    display_order: number;
};

export default function Index({
    people,
}: PageProps<{ people: Person[] }>) {
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
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {people.length === 0 ? (
                                <p className="text-gray-500">
                                    登録されている対象者はいません。
                                </p>
                            ) : (
                                <ul className="divide-y divide-gray-200">
                                    {people.map((person) => (
                                        <li
                                            key={person.id}
                                            className="py-3 first:pt-0 last:pb-0"
                                        >
                                            {person.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
