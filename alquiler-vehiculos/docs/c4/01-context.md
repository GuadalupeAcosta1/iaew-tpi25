# C4 - Nivel 1: Contexto del Sistema

c4Context
title Diagrama de Contexto - Sistema de Alquiler de Vehículos

    Person(customer, "Cliente", "Utiliza la app para reservar vehículos.")

    System_Boundary(system, "Sistema de Alquiler") {
        System(api, "API de Alquiler", "Gestiona reservas, vehículos y usuarios.")
    }

    System_Ext(mail, "Sistema de Correo", "Envía notificaciones.")
    System_Ext(inventory, "Inventario Externo", "Valida disponibilidad física (gRPC).")
    System_Ext(auth, "Keycloak (IdP)", "Autenticación y Tokens.")

    Rel(customer, api, "Usa", "HTTPS")
    Rel(api, mail, "Envía emails", "SMTP")
    Rel(api, inventory, "Consulta", "gRPC")
    Rel(api, auth, "Valida token", "HTTPS")

El sistema de **Alquiler de Vehículos Urbanos** permite a los usuarios alquilar autos, bicicletas y scooters de manera ágil desde una app web o móvil.

**Actores principales:**

- **Usuario:** utiliza la aplicación para crear y confirmar reservas.
- **API REST:** núcleo del sistema, gestiona vehículos y reservas.
- **Base de Datos (PostgreSQL):** almacena el estado de las reservas y los vehículos.
- **Broker (RabbitMQ):** maneja las tareas asincrónicas como verificaciones o notificaciones.
- **Keycloak (futuro):** proveerá autenticación y emisión de JWT.
- **Sistema Externo (Inventario):** stub gRPC que simula la consulta de disponibilidad de vehículos.
