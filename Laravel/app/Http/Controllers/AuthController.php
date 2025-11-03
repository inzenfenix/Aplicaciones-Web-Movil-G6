<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    /**
    * Función que muestra la vista de logueados o la vista con el formulario de Login
    */
    public function index()
    {
        // Comprobamos si el usuario ya está logueado
        if (Auth::check()) {
            // Si está logueado le mostramos la vista de logueados
            return view('/inicio');
        }

        // Si no está logueado le mostramos la vista con el formulario de login
        return view('login');
    }
    
    /**
    * Función que se encarga de recibir los datos del formulario de login, comprobar que el usuario existe y
    * en caso correcto logar al usuario
    */
    public function login(Request $request)
    {
        // Comprobamos que el email y la contraseña han sido introducidos
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Almacenamos las credenciales de email y contraseña
        $credentials = $request->only('email', 'password');

        // Si el usuario existe lo logamos y lo llevamos a la vista de "inicio" con un mensaje
        if (Auth::attempt($credentials)) {
            return redirect()->intended('inicio')
                ->with('success', 'Logueado Correctamente');
        }

        // Si el usuario no existe devolvemos al usuario al formulario de login con un mensaje de error
        return redirect("/")->with('error', 'Los datos introducidos no son correctos');
    }
    
    /**
    * Función que muestra la vista de logueados si el usuario está logueado y si no le devuelve al formulario de login
    * con un mensaje de error
    */
    public function logueados()
    {
        if (Auth::check()) {
            return view('/inicio');
        }

        return redirect("/")->with('error', 'No tienes acceso, por favor inicia sesión');
    }
    
    public function logout(Request $request) {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/')->with('success', 'Has cerrado sesión correctamente');
    }
}