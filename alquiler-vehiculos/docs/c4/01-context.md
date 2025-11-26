# C4 - Nivel 1: Contexto del Sistema

```mermaid
graph TD
    %% Estilos
    classDef person fill:#08427b,stroke:#052e56,color:white;
    classDef internal fill:#1168bd,stroke:#0b4884,color:white;
    classDef external fill:#999999,stroke:#666666,color:white;

    %% Nodos
    User((Cliente)):::person

    subgraph System [Sistema de Alquiler]
        API[API de Alquiler]:::internal
    end

    Mail[Sistema de Correo]:::external
    Inv[Inventario Externo gRPC]:::external
    KC[Keycloak IdP]:::external

    %% Relaciones
    User -- Usa (HTTPS) --> API
    API -- Envía (SMTP) --> Mail
    API -- Consulta (gRPC) --> Inv
    API -- Valida Token (HTTPS) --> KC
```

El sistema de **Alquiler de Vehículos Urbanos** permite a los usuarios alquilar autos, bicicletas y scooters de manera ágil desde una app web o móvil.

**Actores principales:**

- **Usuario:** utiliza la aplicación para crear y confirmar reservas.
- **API REST:** núcleo del sistema, gestiona vehículos y reservas.
- **Base de Datos (PostgreSQL):** almacena el estado de las reservas y los vehículos.
- **Broker (RabbitMQ):** maneja las tareas asincrónicas como verificaciones o notificaciones.
- **Keycloak (futuro):** proveerá autenticación y emisión de JWT.
- **Sistema Externo (Inventario):** stub gRPC que simula la consulta de disponibilidad de vehículos.
