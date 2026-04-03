<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTareaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }
    public function rules(): array
    {
        return [
            'titulo' => 'required|string|max:150',
            'descripcion' => 'nullable|string',
            'fecha_limite' => 'nullable|date',
            'latitud' => 'nullable|numeric|between:-90,90',
            'longitud' => 'nullable|numeric|between:-180,180',
        ];
    }
    public function messages(): array
    {
        return [
            'titulo.required' => 'El titulo es obligatorio',
            'titulo.max' => 'El titulo no puede exceder 150 caracteres',
            'fecha_limite.date' => 'La fecha limite debe ser una fecha valida',
            'latitud.between' => 'La latitud debe estar entre -90 y 90',
            'longitud.between' => 'La longitud debe estar entre -180 y 180',
        ];
    }
}
