<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Tag;
use Illuminate\Database\Seeder;

class TareaSeeder extends Seeder
{
        public function run(): void
    {
        {
        $user = User::where('email', 'demo@example.com')->first();
        $tags = Tag::all();

        // Tarea 1: Completada, con tags
        $tarea1 = $user->tareas()->create([
            'titulo' => 'Configurar entorno de desarrollo',
            'descripcion' => 'Instalar PHP, Composer, PostgreSQL y Laravel',
            'completada' => true,
            'fecha_limite' => now()->subDays(2),
        ]);
        $tarea1->tags()->attach([$tags[2]->id]); // Trabajo

        // Tarea 2: Pendiente, urgente
        $tarea2 = $user->tareas()->create([
            'titulo' => 'Entregar prueba técnica',
            'descripcion' => 'Subir código a GitLab y notificar a evaluadores',
            'completada' => false,
            'fecha_limite' => now()->addDays(3),
        ]);
        $tarea2->tags()->attach([$tags[0]->id, $tags[2]->id]); // Urgente, Trabajo

        // Tarea 3: Pendiente, personal
        $tarea3 = $user->tareas()->create([
            'titulo' => 'Comprar víveres',
            'descripcion' => 'Leche, pan, huevos, frutas',
            'completada' => false,
            'fecha_limite' => now()->addDays(1),
        ]);
        $tarea3->tags()->attach([$tags[1]->id, $tags[3]->id]); // Personal, Casa

        // Tarea 4: Sin fecha límite
        $tarea4 = $user->tareas()->create([
            'titulo' => 'Aprender sobre Eloquent ORM',
            'descripcion' => 'Estudiar relaciones, scopes y mutators',
            'completada' => false,
            'fecha_limite' => null,
        ]);
        $tarea4->tags()->attach([$tags[4]->id]); // Estudio

        // Tarea 5: Con ubicación
        $tarea5 = $user->tareas()->create([
            'titulo' => 'Reunión en oficina',
            'descripcion' => 'Revisar avances del proyecto',
            'completada' => false,
            'fecha_limite' => now()->addDays(5),
            'latitud' => 19.005082,
            'longitud' => -98.204534,
        ]);
        $tarea5->tags()->attach([$tags[2]->id]); // Trabajo
    }
    }
}
