<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssignTagsRequest extends FormRequest
{
   
    public function authorize(): bool
    {
        return true;
    }
        public function rules(): array
    {
        return [
            'tags' => 'required|array',
            'tags.*' => 'exists:tags,id',
        ];
    }
    public function messages(): array
    {
        return [
            'tags.required' => 'Debes enviar al menos un tag',
            'tags.array' => 'Los tags deben ser un arreglo',
            'tags.*.exists' => 'Uno o mas tags no existen',
        ];
    }
}
