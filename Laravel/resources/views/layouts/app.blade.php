<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ config('app.name', 'Laravel') }}</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

    <!-- Scripts -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="font-sans antialiased">
    <div class="min-h-screen bg-gray-100">
        <!-- Topbar con background celeste y rutas al medio -->
        <nav class="dashboard-topbar">
            <div class="topbar-routes">
                <a href="{{ url('/inicio') }}" class="route-link {{ request()->is('inicio') ? 'active' : '' }}">Inicio</a>
                <a href="{{ url('/') }}" class="route-link {{ request()->is('reports') ? 'active' : '' }}">Buscador</a>
                <a href="{{ url('/alergias') }}" class="route-link {{ request()->is('alergias') ? 'active' : '' }}">Alergias</a>
                <a href="{{ url('/dashboard') }}" class="route-link {{ request()->is('dashboard') ? 'active' : '' }}">Dashboard</a>
            </div>
        </nav>

        <!-- Page Content -->
        <main>
            @yield('content')
        </main>
    </div>

    <style>
    .dashboard-topbar {
        background: linear-gradient(135deg, #81dbffff, #81dbffff);
        padding: 0 20px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        border-bottom: 1px solid #81dbffff;
    }

    .topbar-routes {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 30px;
        height: 60px;
        margin: 0 auto;
        max-width: 1200px;
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

    /* Responsive */
    @media (max-width: 768px) {
        .dashboard-topbar {
            padding: 0 10px;
        }

        .topbar-routes {
            gap: 15px;
            height: 50px;
            flex-wrap: wrap;
            padding: 10px 0;
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
        .topbar-routes {
            gap: 10px;
        }

        .route-link {
            font-size: 13px;
            padding: 5px 10px;
        }
    }
    </style>
</body>
</html>