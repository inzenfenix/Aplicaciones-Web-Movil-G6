# Sistema de Fichas Médicas para el uso del rubro de la medicina

## Requerimientos

 - AWS CLI (Cuenta de AWS)
 - Node.JS 22
 - Flutter SDK

## Inicialización

1. Para inicializar el sistema se necesita tener las credenciales de AWS funcionales con permisos administrativos,
el siguiente comando se puede utilizar para la configuración:

### PRECAUCIÓN
> EL SISTEMA NECESITA UN ROL LLAMADO (LabRole), con los permisos necesarios para utilizar API Gateway (REST API y WebSocket), Lambda y Dynamo.

    ``` bash
    aws configure
    ```

2. Para inicializar el backend se utiliza los siguientes comandos (dentro de la carpeta: **cora-backend**):

    ``` bash
    npm i -g serverless
    npm i
    serverless deploy
    # o sls deploy, si es linux o cmd
    ```

3. Para obtener una muestra de datos aleatorios para la prueba del sistema es necesario utilizar serverless offline:
    ``` bash
    serverless offline start
    ```

    Luego, puede utilizar la ruta **localhost:3000/randomize** , para obtener los datos aleatorios

    ### PRECAUCIÓN
    > LA FUNCIÓN RANDOMIZE SE DEMORA ENTRE 2-5 MINUTOS


4. En cada carpeta se encuentran las Aplicaciones de frontend correspondiente, utilice los sistemas de estos Frameworks para inicializarlo, por ejemplo para Ionic:

    ``` bash
    npm install -g @ionic/cli
    npm i
    ionic serve
    ```

5. Para el funcionamiento correcto de las aplicaciones (en etapa de desarrollo) debes provisionar tus propios archivos .env, todas las aplicaciones utilizan el siguiente fórmato para su .env:

    ```
    BACKEND_ADDRESS=<BACKEND_URL>
    ```

    ### IONIC
    - Como Ionic utiliza su propia sistema de .env, es parte de environment.ts
    ``` json
        # Los datos de amazon son específicamente para probar el sistema de lector de recetas
        AWS_ACCESS_KEY_ID: <KEY>,
        AWS_SECRET_ACCESS_KEY_ID: <SECRET_KEY>,
        AWS_SESSION_TOKEN: <SESSION_TOKEN>,
        API_URL:<BACKEND_URL>
    ```

# Cora App - Frontend Ionic

Este es el frontend de la aplicación móvil **Cora**, desarrollada con **Ionic** y **Angular**. La aplicación incluye funcionalidades como el lector de recetas e integración con servicios AWS.

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente en tu sistema:

1.  **Node.js** (Se recomienda la versión LTS más reciente).
2.  **NPM** (Viene incluido con Node.js).
3.  **Ionic CLI**: Instálalo globalmente ejecutando:
    ```bash
    npm install -g @ionic/cli
    ```

## 🚀 Instalación y Configuración

Sigue estos pasos para echar a andar el proyecto localmente:

1.  **Clonar el repositorio** (si aún no lo has hecho) y navegar a la carpeta del frontend:
    ```bash
    cd ruta/a/tu/proyecto/Ionic/cora-app
    ```

2.  **Instalar dependencias**:
    Este proyecto utiliza librerías específicas como `@aws-sdk/client-dynamodb`, `chart.js` y `lucide-angular`. Instálalas ejecutando:
    ```bash
    npm install
    ```

3.  **Configuración de Entorno (AWS)**:
    Dado que el proyecto utiliza el SDK de AWS para DynamoDB, es probable que necesites configurar tus credenciales o endpoints.
    * Revisa el archivo `src/environments/environment.ts` y asegúrate de que las claves de acceso o la configuración de la región sean correctas para tu entorno de desarrollo local.

## 🏃‍♂️ Ejecución

Para iniciar el servidor de desarrollo local y ver la aplicación en tu navegador:

```bash
ionic serve
```
### Laravel
   # CORA - Sistema de Gestión Médica

   Sistema de gestión médica con Laravel y AWS DynamoDB.

   ---

   ## Requisitos Previos

    - **PHP** >= 8.1
    - **Composer**
    - **Node.js** y **NPM**
    - **MySQL** >= 8.0 (para autenticación)
    - **Cuenta AWS activa** (para DynamoDB)

   ### Verificar instalaciones:
    ```bash
    php -v
    composer -v
    node -v
    npm -v
    mysql --version
    ```

   ---

   ## Instalación

   ### 1. Clonar/Descargar el proyecto
    ```bash
    cd Laravel
    ```

   ### 2. Instalar dependencias PHP
    ```bash
    composer install
    ```

   ### 3. **OBLIGATORIO: Instalar AWS SDK para DynamoDB**
    ```bash
    composer require aws/aws-sdk-php
    ```

   ### 4. Instalar dependencias Node
    ```bash
    npm install
    ```

   ### 5. Configurar entorno
    ```bash
   # Windows
    copy .env.example .env

   # Mac/Linux
    cp .env.example .env

    php artisan key:generate
    ```

   ### 6. **Crear Base de Datos MySQL**

    Abre tu cliente MySQL (phpMyAdmin, MySQL Workbench, o terminal):

    ```sql
    CREATE DATABASE cora_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ```

   ### 7. **Configurar `.env`**

    Abre el archivo `.env` y configura:

    ```env
   # ========== APLICACIÓN ==========
    APP_NAME=CORA
    APP_ENV=local
    APP_KEY=base64:... (generado automáticamente)
    APP_DEBUG=true
    APP_URL=http://localhost:8000

   # ========== BASE DE DATOS MYSQL (PARA AUTENTICACIÓN) ==========
    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=cora_db
    DB_USERNAME=root
    DB_PASSWORD=          # Tu contraseña de MySQL (vacío si no tienes)

   # ========== CONFIGURACIÓN DYNAMODB (PARA GESTIÓN MÉDICA) ==========
    DYNAMODB_CONNECTION=
    DYNAMODB_TABLE_PREFIX=
    DYNAMODB_ENDPOINT=

   # ========== CREDENCIALES AWS (PARA DYNAMODB) ==========
    AWS_DEFAULT_REGION=us-east-1
    AWS_USE_PATH_STYLE_ENDPOINT=false
    ```
   ### 9. **Ejecutar Migraciones**

    Crea las tablas de autenticación en MySQL:

    ```bash
    php artisan migrate
    ```

    Esto creará las tablas: `users`, `password_resets`, `failed_jobs`, etc.

   ### 10. **Ejecutar Seeders (Crear Usuario de Ejemplo)**

    Ejecuta el seeder para crear el usuario de prueba:

    ```bash
    php artisan db:seed
    ```

   **Usuario de ejemplo creado:**
    - **Email:** `test@example.com`
    - **Contraseña:** `holamundo1234`

   ### 11. Compilar assets
    ```bash
    npm run dev
    ```

   ### 12. Iniciar servidor
    ```bash
    php artisan serve
    ```

    Accede en: `http://localhost:8000`

   ---
