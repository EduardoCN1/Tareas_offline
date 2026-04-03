<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use App\Http\Requests\StoreTagRequest;


class TagController extends Controller
{
    // GET /api/tags - Listar todos los tags
    public function index()
    {
        $tags = Tag::all();
        return response()->json($tags);
    }

    // POST /api/tags - Crear nuevo tag
    public function store(StoreTagRequest $request)
    {
        $tag = Tag::create([
            'nombre' => $request->nombre,
            'color' => $request->color,
        ]);
        return response()->json($tag, 201);
    }

    // DELETE /api/tags/{id} - Eliminar tag
    public function destroy(string $id)
    {
        $tag = Tag::find($id);
        if (!$tag) {
            return response()->json([
                'message' => 'Tag no encontrado'
            ], 404);
        }
        $tag->delete();
        return response()->json([
            'message' => 'Tag eliminado correctamente'
        ]);
    } 
}
