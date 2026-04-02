<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Tarea extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'titulo',
        'descripcion',
        'completada',
        'fecha_limite',
        'latitud',
        'longitud',
    ];

    protected $casts = [
        'completada' => 'boolean',
        'fecha_limite' => 'date',
        'latitud' => 'decimal:7',
        'longitud' => 'decimal:7',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'tarea_tag');
    }
}