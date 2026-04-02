<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Tag extends Model
{
    Use HasFactory;

    protected $fillable = [
        'nombre',
        'color',
    ];

    public function tareas()
    {
        return $this->belongsToMany(Tarea::class, 'tarea_tag');
    }
}
