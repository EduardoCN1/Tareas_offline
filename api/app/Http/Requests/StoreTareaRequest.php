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
            //Titulo de la tarea
            'titulo' => 'required|string|max:150',
            //Descripción de la tarea
            'descripcion' => 'nullable|string',
            //Fecha límite para completar la tarea
            'fecha_limite' => 'nullable|date',
            //Latitud de la ubicación de la tarea
            'latitud' => 'nullable|numeric|between:-90,90',
            //Longitud de la ubicación de la tarea
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
