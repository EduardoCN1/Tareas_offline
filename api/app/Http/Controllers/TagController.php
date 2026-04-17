<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use App\Http\Requests\StoreTagRequest;


class TagController extends Controller
{
    /**
     * Listar todos los tags..
     *
     * Muestra una lista de todos los tags disponibles.
     */
    public function index()
    {
        $tags = Tag::all();
        return response()->json($tags);
    }
    /**
     * Crear un nuevo tag..
     *
     * Crea un nuevo tag con los datos proporcionados.
     */
    public function store(StoreTagRequest $request)
    {
        $tag = Tag::create([
            'nombre' => $request->nombre,
            'color' => $request->color,
        ]);
        return response()->json($tag, 201);
    }

     /**
     * Eliminar un tag..
     *
     * Elimina un tag con el ID proporcionado.
     */
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
