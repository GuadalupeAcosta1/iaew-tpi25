# C4 - Nivel 2: Contenedores

c4Container
title Diagrama de Contenedores

    Person(user, "Cliente", "Web/Mobile App")

    System_Boundary(box, "Alquiler de Vehículos") {
        Container(api, "API REST", "Node.js/Express", "Maneja lógica de negocio y endpoints.")
        Container(db, "Base de Datos", "PostgreSQL", "Almacena vehículos y reservas.")
        Container(broker, "Broker", "RabbitMQ", "Cola de mensajes para asincronía.")
        Container(worker, "Worker", "Node.js", "Procesa verificaciones en segundo plano.")
    }

    Rel(user, api, "Llama a", "JSON/HTTPS")
    Rel(api, db, "Lee/Escribe", "SQL/TCP")
    Rel(api, broker, "Publica eventos", "AMQP")
    Rel(broker, worker, "Consume eventos", "AMQP")
    Rel(worker, db, "Actualiza estado", "SQL/TCP")

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
