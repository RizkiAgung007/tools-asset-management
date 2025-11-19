<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;

class AuthController extends Controller
{
    /**
     * Function for user login
     */
    public function login(Request $request)
    {
        $request->validate([
            'email'     => 'required|email',
            'password'  => 'required'
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Email atau Password salah'
            ], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();

        $token = $user->createToken('auth_token')->plainTextToken;
        $cookie = cookie('jwt', $token, 60 * 24);

        return response()->json([
            'message' => 'Login Berhasil',
            'user'    => $user,
            'token'   => $token
        ])->withCookie($cookie);
    }

    /**
     * Function for user logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        $cookie = Cookie::forget('jwt');

        return response()->json([
            'message' => 'Logout Berhasil'
        ])->withCookie($cookie);
    }

    public function me(Request $request)
    {
        return $request->user();
    }
}
