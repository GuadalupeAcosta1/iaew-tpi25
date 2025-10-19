# ADR-0004: Seguridad (OAuth2 + JWT)


## Contexto
Se requiere autenticación centralizada y autorización por roles.


## Decisión
Implementar **OAuth2 Resource Server** validando tokens **JWT emitidos por Keycloak**.


## Alternativas consideradas
- **API Key:** simple pero poco segura y sin granularidad.
- **Sesiones en servidor:** rompen la escalabilidad stateless.


## Consecuencias
- (+) Tokens firmados, verificación distribuida y sin estado.
- (-) Requiere configuración del issuer y validación de JWKs.