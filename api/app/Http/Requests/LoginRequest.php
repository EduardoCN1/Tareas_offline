<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            //Correo electronico 
            'email' => 'required|string|email',
            //Contraseña
            'password' => 'required|string',
        ];
    }
     public function messages(): array
    {
        return [
            'email.required' => 'El correo es obligatorio',
            'email.email' => 'El correo debe ser válido',
            'password.required' => 'La contraseña es obligatoria',
        ];
    }
}
