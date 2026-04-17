<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAvatarRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // El campo 'avatar' es obligatorio, debe ser una imagen y no puede pesar más de 2MB
             'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ];
    }
    public function messages(): array
    {
        return [
            'avatar.required' => 'La imagen es obligatoria',
            'avatar.image' => 'El archivo debe ser una imagen',
            'avatar.mimes' => 'La imagen debe ser jpeg, png, jpg o gif',
            'avatar.max' => 'La imagen no puede pesar más de 2MB',
        ];
    }
}
