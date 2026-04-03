<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class TareaController extends Controller
{
    // GET /api/tareas - Listar tareas del usuario autenticado
    public function index(Request $request)
    {
        $tareas = $request->user()->tareas()->with('tags')->get();
        return response()->json($tareas);
    }
    // POST /api/tareas - Crear nueva tarea
    public function store(Request $request)
    {
        $request->validate([
            'titulo' => 'required|string|max:150',
            'descripcion' => 'nullable|string',
            'fecha_limite' => 'nullable|date',
            'latitud' => 'nullable|numeric|between:-90,90',
            'longitud' => 'nullable|numeric|between:-180,180',
        ]);

        $tarea = $request->user()->tareas()->create([
            'titulo' => $request->titulo,
            'descripcion' => $request->descripcion,
            'fecha_limite' => $request->fecha_limite,
            'latitud' => $request->latitud,
            'longitud' => $request->longitud,
        ]);

        return response()->json($tarea, 201);
    }
    // GET /api/tareas/{id} - Ver detalle de una tarea
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
    // PUT /api/tareas/{id} - Actualizar tarea
    public function update(Request $request, string $id)
    {
        $tarea = $request->user()->tareas()->find($id);
        if (!$tarea) {
            return response()->json([
                'message' => 'Tarea no encontrada'
            ], 404);
        }
        $request->validate([
            'titulo' => 'sometimes|required|string|max:150',
            'descripcion' => 'nullable|string',
            'completada' => 'sometimes|boolean',
            'fecha_limite' => 'nullable|date',
            'latitud' => 'nullable|numeric|between:-90,90',
            'longitud' => 'nullable|numeric|between:-180,180',
        ]);
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
    // DELETE /api/tareas/{id} - Eliminar tarea
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
    // POST /api/tareas/{id}/tags - Asignar tags a una tarea
    public function assignTags(Request $request, string $id)
    {
        $tarea = $request->user()->tareas()->find($id);
        if (!$tarea) {
            return response()->json([
                'message' => 'Tarea no encontrada'
            ], 404);
        }
        $request->validate([
            'tags' => 'required|array',
            'tags.*' => 'exists:tags,id',
        ]);
        $tarea->tags()->sync($request->tags);
        return response()->json($tarea->load('tags'));
    }
    // DELETE /api/tareas/{id}/tags/{tag_id} - Quitar un tag de una tarea
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
