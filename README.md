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