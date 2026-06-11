<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $categoryKeys = array_keys(config('documents.categories', []));
        $channelKeys = array_keys(config('documents.channels', []));

        return [
            'person_id' => ['required', 'integer', 'exists:people,id'],
            'title' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', Rule::in($categoryKeys)],
            'type' => ['nullable', 'string', 'max:255'],
            'expiry_date' => ['nullable', 'date'],
            'memo' => ['nullable', 'string', 'max:5000'],
            'channels' => ['required', 'array', 'min:1'],
            'channels.*' => ['string', Rule::in($channelKeys)],
            'reminder_days' => ['nullable', 'array'],
            'reminder_days.*' => ['integer', 'min:1', 'max:3650'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'person_id' => '対象者',
            'title' => 'タイトル',
            'category' => '分類',
            'type' => '種別',
            'expiry_date' => '有効期限',
            'memo' => 'メモ',
            'channels' => '通知手段',
            'reminder_days' => '通知日',
        ];
    }
}
