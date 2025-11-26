# C4 - Nivel 2: Contenedores

```mermaid
graph TD
    %% Estilos
    classDef person fill:#08427b,stroke:#052e56,color:white;
    classDef container fill:#438dd5,stroke:#333,color:white;
    classDef db fill:#2f95c7,stroke:#333,color:white;

    %% Actores
    User((Cliente Web/App)):::person

    %% Sistema
    subgraph Box [Contenedores Alquiler]
        API[API REST<br/>Node.js + Express]:::container
        Broker[[Broker<br/>RabbitMQ]]:::container
        Worker[Worker<br/>Node.js]:::container
        DB[(Base de Datos<br/>PostgreSQL)]:::db
    end

    %% Relaciones
    User -- 1. HTTPS/JSON --> API
    API -- 2. Lee/Escribe --> DB
    API -- 3. Publica Evento --> Broker
    Broker -- 4. Consume Evento --> Worker
    Worker -- 5. Actualiza Estado --> DB
```

**Contenedores del sistema:**

- **API (Node.js + Express):** punto de entrada, expone endpoints `/vehicles`, `/reservations` y `/reservations/{id}/confirm`.
- **Worker (placeholder):** simula consumo de mensajes desde RabbitMQ.
- **DB (PostgreSQL):** persistencia de datos de vehículos y reservas.
- **Broker (RabbitMQ):** middleware para comunicación asincrónica.
- **Keycloak (futuro):** gestión de autenticación.

**Flujo general:**

1. El usuario envía una solicitud a la API.
2. La API valida y persiste la reserva en la DB.
3. Se encola un mensaje en RabbitMQ para procesar la verificación.
4. El Worker (placeholder) consume el mensaje y simula la notificación.

```

```
