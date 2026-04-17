<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTagRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            //Nombre del tag
            'nombre' => 'required|string|max:50',
            //Color del tag en formato hexadecimal (ej: #FF0000)
            'color' => 'required|string|size:7|regex:/^#[A-Fa-f0-9]{6}$/',
        ];
    }
    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre es obligatorio',
            'nombre.max' => 'El nombre no puede exceder 50 caracteres',
            'color.required' => 'El color es obligatorio',
            'color.size' => 'El color debe tener 7 caracteres (ej: #FF0000)',
            'color.regex' => 'El color debe ser hexadecimal válido (ej: #FF0000)',
        ];
    }

}
