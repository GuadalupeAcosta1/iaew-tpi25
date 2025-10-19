# ADR-0003: Base de Datos (PostgreSQL vs NoSQL)


## Contexto
El dominio necesita relaciones (vehículo-reserva) y transacciones seguras.


## Decisión
Utilizar **PostgreSQL** como base relacional estándar, con soporte a integridad referencial y migraciones SQL simples.


## Alternativas consideradas
- **MongoDB:** esquema flexible, pero innecesario para datos bien estructurados.
- **SQLite:** simple, pero sin soporte concurrente para múltiples instancias.


## Consecuencias
- (+) Relaciones consistentes y soporte ACID.
- (-) Menor elasticidad horizontal frente a NoSQL.