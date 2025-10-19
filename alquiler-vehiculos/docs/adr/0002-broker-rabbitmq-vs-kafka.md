# ADR-0002: Broker de Mensajería (RabbitMQ vs Kafka)


## Contexto
El sistema requiere asincronía para validaciones de reservas y notificaciones sin bloquear la API.


## Decisión
Usar **RabbitMQ**, por su simplicidad, disponibilidad de imagen oficial y facilidad de configuración en entornos pequeños.


## Alternativas consideradas
- **Kafka:** más potente para grandes volúmenes, pero sobrecargado para un flujo simple.
- **Redis Streams:** opción ligera, pero sin el tooling visual de RabbitMQ.


## Consecuencias
- (+) Fácil de probar localmente, interfaz web de monitoreo.
- (-) No óptimo para streaming masivo o particiones distribuidas.