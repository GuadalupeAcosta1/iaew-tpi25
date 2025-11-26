# C4 - Nivel 3: Componentes de la API

```mermaid
graph TD
    %% Estilos
    classDef ctrl fill:#85bbf0,stroke:#333,color:black;
    classDef svc fill:#85bbf0,stroke:#333,color:black;
    classDef repo fill:#f0f0f0,stroke:#333,color:black;

    %% Componentes
    subgraph API [API Components]
        C1(VehiclesController):::ctrl
        C2(ReservationsController):::ctrl

        S1(ReservationService):::svc

        R1[VehicleRepository]:::repo
        R2[ReservationRepository]:::repo
        BC[BrokerClient]:::repo
    end

    %% Relaciones
    C1 -- llama a --> R1
    C2 -- llama a --> S1

    S1 -- valida con --> R1
    S1 -- guarda en --> R2
    S1 -- publica en --> BC
```

Componentes internos principales de la API:

- **VehiclesController:** expone endpoints relacionados con vehículos (`GET /vehicles`).
- **ReservationsController:** permite crear y confirmar reservas (`POST /reservations`, `POST /reservations/{id}/confirm`).
- **ReservationService:** implementa las reglas de negocio y valida solapamientos.
- **Repositories:** gestionan acceso a datos (`VehicleRepository`, `ReservationRepository`).
- **BrokerClient:** conexión y publicación de mensajes a RabbitMQ.
- **AuthMiddleware (placeholder):** simula la validación de JWT.
