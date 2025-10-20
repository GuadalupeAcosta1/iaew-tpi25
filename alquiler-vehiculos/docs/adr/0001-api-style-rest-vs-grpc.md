# ADR-0001: Estilo de API (REST vs gRPC)


## Contexto
El sistema debe permitir interacción desde clientes web para alquilar y confirmar reservas.


## Decisión
Adoptar **API REST con JSON** por su simplicidad, compatibilidad con navegadores y herramientas como Postman u OpenAPI.


## Alternativas consideradas
- **gRPC:** excelente rendimiento, pero mayor complejidad y no soportado nativamente por navegadores.
- **GraphQL:** útil para consultas complejas, innecesario para un CRUD estándar.


## Consecuencias
- (+) Fácil integración, documentación y testeo.
- (-) Menor rendimiento frente a gRPC en comunicación entre microservicios.