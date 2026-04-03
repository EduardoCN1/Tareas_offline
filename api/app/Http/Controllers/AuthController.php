<?php

namespace App\Http\Controllers;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Requests\RegisterRequest;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\UpdateAvatarRequest;

class AuthController extends Controller
{
   // POST /api/register
    public function register(RegisterRequest $request)
    {

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }
    // POST /api/login
    public function login(LoginRequest $request)
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Credenciales incorrectas',
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }
    // POST /api/logout
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada correctamente',
        ]);
    }
    // GET /api/me
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    // POST /api/me/avatar
    public function updateAvatar(UpdateAvatarRequest $request)
    {
        $user = $request->user();

        // Eliminar avatar anterior si existe
        if ($user->avatar && file_exists(public_path($user->avatar))) {
            unlink(public_path($user->avatar));
        }

        // Guardar nueva imagen
        $file = $request->file('avatar');
        $extension = $file->getClientOriginalExtension();
        $newFilename = $user->id . '_' . time() . '.' . $extension;
        $file->move(public_path('avatars'), $newFilename);
        $filename = 'avatars/' . $newFilename;

        // Extraer metadatos EXIF (si están disponibles)
        $exifData = null;
        $fullPath = public_path($filename);
        
        if (function_exists('exif_read_data') && in_array($file->getClientOriginalExtension(), ['jpg', 'jpeg'])) {
            try {
                $exif = @exif_read_data($fullPath);
                if ($exif) {
                    $exifData = [
                        'make' => $exif['Make'] ?? null,
                        'model' => $exif['Model'] ?? null,
                        'datetime' => $exif['DateTime'] ?? null,
                        'gps_latitude' => $exif['GPSLatitude'] ?? null,
                        'gps_longitude' => $exif['GPSLongitude'] ?? null,
                    ];
                }
            } catch (\Exception $e) {
                // EXIF no disponible, continuar sin error
            }
        }

        // Actualizar usuario
        $user->update([
            'avatar' => $filename,
            'avatar_exif' => $exifData,
        ]);

        return response()->json([
            'message' => 'Avatar actualizado correctamente',
            'avatar' => $filename,
            'avatar_exif' => $exifData,
        ]);
    }
}