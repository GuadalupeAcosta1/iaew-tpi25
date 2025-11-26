# Alquiler de Vehículos Urbanos — Etapa 2 (Final)

**Entrega**: v1.0.0 — _26-Nov-2025_  
**Dominio**: Alquiler de Vehículos Urbanos  
**Curso**: Integración de Aplicaciones en Entorno Web (IAEW)

Este proyecto implementa una arquitectura de backend distribuida y contenerizada para la gestión de alquileres, integrando seguridad avanzada, comunicación asincrónica, integración con sistemas legacy y observabilidad completa.

## Arquitectura en 1 vistazo

El sistema ha evolucionado de una API monolítica a una arquitectura de microservicios coordinada:

- **API REST (Node.js):** Gateway principal protegido con OAuth2.
- **Identity Provider (Keycloak):** Servidor de autenticación y autorización (JWT).
- **Broker (RabbitMQ):** Bus de mensajes para desacoplar procesos pesados.
- **Worker (Node.js):** Microservicio consumidor que procesa reservas en background.
- **Inventario (gRPC):** Mock de sistema externo para validación de stock.
- **Base de Datos (PostgreSQL):** Persistencia relacional.
- **Observabilidad:** Stack Prometheus + Grafana.

## Documentación de Arquitectura

Toda la documentación de diseño se encuentra en la carpeta [`/docs`](docs/).

### Diagramas C4

Los diagramas se encuentran en [`/docs/c4`](docs/c4):

| Nivel     | Descripción                    | Imagen                                  |
| :-------- | :----------------------------- | :-------------------------------------- |
| Context   | Ecosistema del sistema         | [Ver diagrama](docs/c4/01-context.md)   |
| Container | Contenedores lógicos           | [Ver diagrama](docs/c4/02-container.md) |
| Component | Componentes internos de la API | [Ver diagrama](docs/c4/03-component.md) |

> Las imágenes están en `docs/c4/img/` (context.jpeg, container.jpeg, component.jpeg).

---

### ADRs — Architectural Decision Records

Las decisiones arquitectónicas se encuentran en [`/docs/adr`](docs/adr):

| ID       | Tema                                     | Archivo                                              |
| -------- | ---------------------------------------- | ---------------------------------------------------- |
| ADR-0001 | Estilo de API (REST vs gRPC)             | [Ver ADR](docs/adr/0001-api-style-rest-vs-grpc.md)   |
| ADR-0002 | Broker de Mensajería (RabbitMQ vs Kafka) | [Ver ADR](docs/adr/0002-broker-rabbitmq-vs-kafka.md) |
| ADR-0003 | Base de Datos (Postgres vs NoSQL)        | [Ver ADR](docs/adr/0003-db-postgres-vs-nosql.md)     |
| ADR-0004 | Seguridad (OAuth2 + JWT)                 | [Ver ADR](docs/adr/0004-seguridad-oauth2-jwt.md)     |

---

## Requisitos previos

- Docker ≥ 24.x y Docker Compose V2.
- **RAM sugerida:** 4 GB libres (Keycloak y Grafana consumen recursos).
- **Puertos Libres:** 3000 (API), 3001 (Grafana), 5433 (DB), 8080 (Keycloak), 9090 (Prometheus), 15672 (RabbitMQ), 50051 (gRPC).

## Variables de entorno

Copiar `compose/.env.example` a `compose/.env`. No es necesario editar nada para pruebas locales, los valores por defecto funcionan.

## Cómo levantar local

Ubicarse en la carpeta de composición y ejecutar el script de arranque limpio:

```bash
cd compose
cp .env.example .env
# IMPORTANTE: Reinicio limpio para asegurar configuraciones de Keycloak y DB
docker compose down -v
docker compose up -d --build
```

> **Nota:** Esperar aprox. **60 segundos** hasta que Keycloak finalice su configuración inicial. Puedes verificar con `docker compose ps` que todos los servicios estén en estado `Up` (y `healthy`).

## 🔐 Seguridad y Credenciales

El sistema utiliza **Keycloak** como Servidor de Autorización. Los endpoints de escritura (`POST`) están protegidos.

| Servicio           | URL Local                      | Usuario | Contraseña |
| :----------------- | :----------------------------- | :------ | :--------- |
| **Keycloak Admin** | http://localhost:8080          | `admin` | `admin`    |
| **Grafana**        | http://localhost:3001          | `admin` | `admin`    |
| **Swagger UI**     | http://localhost:3000/api-docs | -       | -          |

### Obtener Token de Acceso (Para Pruebas)

El sistema ya cuenta con un usuario de prueba pre-configurado (`testuser`). Ejecuta este comando en tu terminal para obtener su token:

```bash
curl -X POST http://localhost:8080/realms/alquiler-realm/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=api-alquiler" \
  -d "username=testuser" \
  -d "password=1234" \
  -d "grant_type=password"
```

## 🧪 Cómo ejecutar pruebas

### 1. API & Seguridad (Swagger UI)

1. Ingresa a [**http://localhost:3000/api-docs**](http://localhost:3000/api-docs).
2. Haz clic en el botón **Authorize** (candado, arriba a la derecha).
3. Pega el token obtenido en el paso anterior (Value: `eyJhb...`).
4. Ejecuta el endpoint `POST /reservas` para crear una reserva.
   - **Response:** `201 Created`.
   - **Acción:** Copia el `id` de la reserva que devuelve la respuesta.

### 2. Flujo Asincrónico (Confirmación)

1. En Swagger, busca el endpoint `POST /reservas/{id}/confirmar`.
2. Pega el ID de la reserva en el campo `id`.
3. Ejecuta la petición.
   - **Response:** `202 Accepted` (La API responde inmediatamente, delegando el procesamiento al Worker).

---

## 🔄 Verificación de Integración (Logs)

Para verificar que el sistema funciona integradamente (API -> RabbitMQ -> Worker -> gRPC -> DB), revisa los logs de los contenedores:

1. Abre una terminal en la carpeta del proyecto.
2. Ejecuta:

   ```bash
   docker compose logs -f worker inventory
   ```

3. Secuencia esperada en los logs:

- `[Worker]` Recibido mensaje para confirmar reserva...
- `[Worker]` Consultando stock vía gRPC...
- `[Inventory]` (gRPC) Verificando disponibilidad...
- `[Worker]` Stock confirmado. Actualizando DB...
- `[Worker]` ✅ Reserva finalizada con éxito.

---

## 📊 Cómo observar (Grafana)

El sistema incluye monitoreo en tiempo real.

1. Ingresa a [**http://localhost:3001**](http://localhost:3001).
2. **Login:** `admin` / `admin` (puedes saltar el cambio de contraseña).
3. Configura el origen de datos (si no está configurado):
   - Ve a **Connections > Data Sources**.
   - Click en **Add new data source** -> Selecciona **Prometheus**.
   - URL: `http://prometheus:9090`
   - Click en **Save & Test**.
4. Visualiza métricas:
   - Ve a **Dashboards** -> Create Dashboard.
   - Selecciona una métrica, por ejemplo: `rate(http_request_duration_seconds_count[1m])`.
   - Genera tráfico en la API y observa cómo cambian los gráficos.

---

## ⚙️ Tecnologías e Integraciones

- **API Gateway:** Node.js + Express (Puerto 3000).
- **Seguridad:** OAuth2 / OpenID Connect con Keycloak (Puerto 8080).
- **Mensajería:** RabbitMQ para desacoplar la confirmación de reservas (Puertos 5672/15672).
- **Integración Legacy:** Comunicación gRPC con servicio simulado de Inventario (Puerto 50051).
- **Base de Datos:** PostgreSQL (Puerto 5433).
- **Observabilidad:** Prometheus + Grafana (Puerto 3001) + Logs JSON (Pino).

---

## 🏷️ Tag y commit de la entrega

- **Tag:** `v1.0.0`
- **Commit Hash:** `(Pega aquí tu último hash de git)`
