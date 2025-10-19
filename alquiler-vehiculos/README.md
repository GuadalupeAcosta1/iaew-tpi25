# Alquiler de Vehículos Urbanos — Etapa 1 (Diseño & Arquitectura)

**Entrega**: v1.0.0 — _26-Oct-2025_  
**Dominio**: Alquiler de Vehículos Urbanos  
**Entidades**: Vehículo, Reserva  
**Transacción**: Confirmar reserva (solapamientos, bloqueo, contrato)  
**Asincronía**: Verificación diferida (licencia/crédito simulado) y notificación  
**Integración**: gRPC a “Inventario” externo (stub local)

## Arquitectura en 1 vistazo
Ver imágenes C4 en `/docs` (placeholders).  
- API REST (Node.js + Express).
- DB PostgreSQL.
- Broker RabbitMQ.
- Integración gRPC (stub).

## Requisitos previos
- Docker ≥ 24.x y Docker Compose V2
- RAM sugerida: 4 GB libres
- Puertos: 3000 (API), 5432 (Postgres), 5672/15672 (RabbitMQ)

## Variables de entorno
Copiar `compose/.env.example` a `compose/.env` y ajustar:
- `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_USER`
- `JWT_SECRET` (placeholder)
- `RABBITMQ_DEFAULT_USER`, `RABBITMQ_DEFAULT_PASS`

## Cómo levantar local
```bash
cd compose
cp .env.example .env
docker compose up -d --build
# Esperar 10-15s y probar health:
curl -s http://localhost:3000/health
```

Servicios esperados:
- API: http://localhost:3000
- Postgres: localhost:5432
- RabbitMQ Mgmt: http://localhost:15672 (user/pass del .env)

## Usuarios/credenciales de prueba
- RabbitMQ: ver `.env`
- API: demo sin OAuth2 (token JWT simulado en headers).

## Cómo ejecutar pruebas
Incluye colección Postman mínima (`api/postman/Alquiler.postman_collection.json`).
- Importar la colección
- Ejecutar petición **GET /health**

Carga: colección `api/postman/carga.postman_collection.json` (placeholder).

## Cómo observar
Versión simple (sin Grafana). Revisar:
- Logs en consola del contenedor `api`
- Endpoint `/metrics` (placeholder simple) y logs JSON

## Flujo asincrónico
- Endpoint `POST /reservas/{id}/confirmar` devuelve `202 Accepted` y encola un mensaje simulado.
- Consumer **NO incluido** en esta versión simple (se deja hook en código para futuro).

## Integración
- Proto gRPC en `api/proto/inventario.proto` (stub). No se levanta server externo en esta etapa.

## Limitaciones y mejoras futuras
- Falta OAuth2 completo (se deja middleware placeholder).
- Falta consumer/verificación real y notificaciones reales.
- Falta dashboard p95/throughput/error-rate (futuro: OTEL + Grafana).

## Tag y commit de la entrega
- Tag: `v1.0.0`
- Commit hash: `57e3da7`

---

## Checklist obligatorio
- [x] Proyecto y dominio elegido
- [x] Arquitectura en 1 vistazo
- [x] Requisitos previos
- [x] Variables de entorno (.env.example)
- [x] Cómo levantar local
- [x] Usuarios/credenciales de prueba
- [x] Cómo ejecutar pruebas (Postman mínimo)
- [x] Cómo observar (logs/metrics simples)
- [x] Flujo asincrónico (hook)
- [x] Integración (proto gRPC)
- [x] Limitaciones y mejoras futuras
- [x] Tag y commit
