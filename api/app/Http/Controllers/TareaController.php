<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\StoreTareaRequest;
use App\Http\Requests\UpdateTareaRequest;
use App\Http\Requests\AssignTagsRequest;

class TareaController extends Controller
{
    /**
     * Listar tareas del usuario autenticado.
     * 
     * Muestra una lista de todas las tareas del usuario autenticado, incluyendo sus tags asociados.
     */
    public function index(Request $request)
    {
        $tareas = $request->user()->tareas()->with('tags')->get();
        return response()->json($tareas);
    }
    /**
     * Crear una nueva tarea.
     * 
     * Crea una nueva tarea para el usuario autenticado con los datos proporcionados.
     */
    public function store(StoreTareaRequest $request)
    {

        $tarea = $request->user()->tareas()->create([
            'titulo' => $request->titulo,
            'descripcion' => $request->descripcion,
            'fecha_limite' => $request->fecha_limite,
            'latitud' => $request->latitud,
            'longitud' => $request->longitud,
        ]);

        return response()->json($tarea, 201);
    }
    /**
     * Ver detalle de una tarea.
     *
     * Muestra los detalles de una tarea específica del usuario autenticado.
     */
    public function show(Request $request, string $id)
    {
         $tarea = $request->user()->tareas()->with('tags')->find($id);
          if (!$tarea) {
            return response()->json([
                'message' => 'Tarea no encontrada'
            ], 404);
        }
        return response()->json($tarea);
    }
    /**
     * Actualizar una tarea.
     *
     * Actualiza los datos de una tarea específica del usuario autenticado.
     */
    public function update(UpdateTareaRequest $request, string $id)
    {
        $tarea = $request->user()->tareas()->find($id);
        
        if (!$tarea) {
            return response()->json([
                'message' => 'Tarea no encontrada'
            ], 404);
        }
        
        $tarea->update($request->only([
            'titulo',
            'descripcion',
            'completada',
            'fecha_limite',
            'latitud',
            'longitud',
        ]));
        return response()->json($tarea);
    }
    /**
     * Eliminar una tarea.
     *
     * Elimina una tarea específica del usuario autenticado.
     */
    public function destroy(Request $request, string $id)
    {
        $tarea = $request->user()->tareas()->find($id);
        if (!$tarea) {
            return response()->json([
                'message' => 'Tarea no encontrada'
            ], 404);
        }
        $tarea->delete();
        return response()->json([
            'message' => 'Tarea eliminada correctamente'
        ]);
    }
    /**
     * Asignar tags a una tarea.
     *
     * Asigna uno o más tags a una tarea específica del usuario autenticado.
     */
    public function assignTags(AssignTagsRequest $request, string $id)
    {
        $tarea = $request->user()->tareas()->find($id);
        if (!$tarea) {
            return response()->json([
                'message' => 'Tarea no encontrada'
            ], 404);
        }
        $tarea->tags()->sync($request->tags);
        return response()->json($tarea->load('tags'));
    }
    /**
     * Quitar un tag de una tarea.
     *
     * Quita un tag de una tarea específica del usuario autenticado.
     */
    public function removeTag(Request $request, string $id, string $tagId)
    {
        $tarea = $request->user()->tareas()->find($id);
        if (!$tarea) {
            return response()->json([
                'message' => 'Tarea no encontrada'
            ], 404);
        }
        $tarea->tags()->detach($tagId);
        return response()->json($tarea->load('tags'));
    }
}
