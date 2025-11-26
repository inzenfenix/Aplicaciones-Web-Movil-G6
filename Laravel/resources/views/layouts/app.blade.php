<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ config('app.name', 'Cora') }}</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Font Awesome (para iconos) -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <!-- Scripts -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="font-sans antialiased">
    <div class="min-h-screen bg-gray-100">
        @auth
        <!-- Topbar con background celeste y rutas al medio -->
        <nav class="dashboard-topbar">
            <div class="container-fluid">
                <div class="d-flex justify-content-between align-items-center">
                    <!-- Botón para volver a la página de inicio -->
                    <a href="{{ url('/inicio') }}" class="btn btn-outline-primary btn-sm">
                        <i class="fas fa-home me-1"></i>Volver al Inicio
                    </a>
                    
                    <!-- Rutas de navegación al centro -->
                    <div class="topbar-routes mx-auto">
                        <a href="{{ url('/inicio') }}" class="route-link {{ request()->is('inicio') ? 'active' : '' }}">Inicio</a>
                        <a href="{{url('/historialConsultas')}}" class="route-link {{ request()->is('historialConsultas') ? 'active' : '' }}">Historial de Consultas</a>
                        <a href="{{ url('/dashboard') }}" class="route-link {{ request()->is('dashboard') ? 'active' : '' }}">Dashboard</a>
                        <a href="{{ url('/patients') }}" class="route-link {{ request()->is('patients') ? 'active' : '' }}">Buscador</a>
                    </div>
                    
                    <!-- Botón de cerrar sesión a la derecha -->
                    <form method="POST" action="{{ route('logout') }}" class="m-0">
                        @csrf
                        <button type="submit" class="btn btn-outline-danger btn-sm">
                            <i class="fas fa-sign-out-alt me-1"></i>Cerrar sesión
                        </button>
                    </form>
                </div>
            </div>
        </nav>
        @endauth
        <!-- Page Content -->
        <main>
            @yield('content')
        </main>
    </div>

    <style>
    .dashboard-topbar {
        background: linear-gradient(135deg, #81dbffff, #81dbffff);
        padding: 15px 20px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        border-bottom: 1px solid #81dbffff;
    }

    .topbar-routes {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 30px;
    }

    .route-link {
        color: #ffffffff;
        text-decoration: none;
        font-weight: 500;
        font-size: 16px;
        padding: 8px 16px;
        border-radius: 6px;
        transition: all 0.3s ease;
        position: relative;
        white-space: nowrap;
    }

    .route-link:hover {
        background-color: rgba(255, 255, 255, 0.3);
        color: #1A365D;
        transform: translateY(-1px);
    }

    .route-link.active {
        background-color: rgba(255, 255, 255, 0.6);
        color: #1A365D;
        font-weight: 600;
    }

    .route-link.active::after {
        content: '';
        position: absolute;
        bottom: -18px;
        left: 50%;
        transform: translateX(-50%);
        width: 6px;
        height: 6px;
        background-color: #1A365D;
        border-radius: 50%;
    }

    .btn-outline-primary {
        border-color: #0d6efd;
        color: #0d6efd;
        background-color: rgba(255, 255, 255, 0.9);
        font-weight: 500;
    }

    .btn-outline-primary:hover {
        background-color: #0d6efd;
        color: white;
        border-color: #0d6efd;
    }

    .btn-outline-danger {
        border-color: #dc3545;
        color: #dc3545;
        background-color: rgba(255, 255, 255, 0.9);
        font-weight: 500;
    }

    .btn-outline-danger:hover {
        background-color: #dc3545;
        color: white;
        border-color: #dc3545;
    }

    /* Responsive */
    @media (max-width: 992px) {
        .dashboard-topbar .d-flex {
            flex-direction: column;
            gap: 15px;
        }

        .topbar-routes {
            flex-wrap: wrap;
            gap: 15px;
        }

        form {
            width: 100%;
        }

        form button {
            width: 100%;
        }
    }

    @media (max-width: 768px) {
        .dashboard-topbar {
            padding: 10px;
        }

        .topbar-routes {
            gap: 10px;
        }

        .route-link {
            font-size: 14px;
            padding: 6px 12px;
        }

        .route-link.active::after {
            bottom: -12px;
        }
    }

    @media (max-width: 480px) {
        .route-link {
            font-size: 13px;
            padding: 5px 10px;
        }
    }
    </style>
</body>
</html>