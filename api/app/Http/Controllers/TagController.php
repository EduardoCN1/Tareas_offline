<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use Illuminate\Http\Request;

class TagController extends Controller
{
    // GET /api/tags - Listar todos los tags
    public function index()
    {
        $tags = Tag::all();
        return response()->json($tags);
    }

    // POST /api/tags - Crear nuevo tag
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:50',
            'color' => 'required|string|size:7|regex:/^#[A-Fa-f0-9]{6}$/',
        ]);
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
