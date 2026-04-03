<?php

namespace Database\Seeders;

use App\Models\Tag;
use Illuminate\Database\Seeder;

class TagSeeder extends Seeder
{
    public function run(): void
    {
         $tags = [
            ['nombre' => 'Urgente', 'color' => '#FF0000'],
            ['nombre' => 'Personal', 'color' => '#00FF00'],
            ['nombre' => 'Trabajo', 'color' => '#0000FF'],
            ['nombre' => 'Casa', 'color' => '#FFA500'],
            ['nombre' => 'Estudio', 'color' => '#800080'],
        ];

        foreach ($tags as $tag) {
            Tag::create($tag);
        }
    }
}
