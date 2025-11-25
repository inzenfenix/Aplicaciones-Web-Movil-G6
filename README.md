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