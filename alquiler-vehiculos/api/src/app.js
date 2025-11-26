import express from "express";
// import morgan from "morgan"; // <-- Lo reemplazamos por pino
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import yaml from "yamljs";
import path from "path";
import { fileURLToPath } from "url";
import { auth } from "express-oauth2-jwt-bearer";
import { connectBroker, publishMessage } from "./broker.js";
// --- NUEVAS IMPORTACIONES ---
import { pinoHttp } from "pino-http";
import client from "prom-client";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. LOGS ESTRUCTURADOS (JSON) ---
// Esto genera logs en formato JSON automáticamente para cada petición
app.use(
  pinoHttp({
    level: process.env.LOG_LEVEL || "info",
    // (Borramos la sección transport para que use JSON nativo)
  })
);

// --- 2. MÉTRICAS (PROMETHEUS) ---
// Creamos un registro de métricas
const register = new client.Registry();
client.collectDefaultMetrics({ register }); // CPU, Memoria, etc.

// Métrica personalizada: Histograma de duración de peticiones HTTP
const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duración de peticiones HTTP en segundos",
  labelNames: ["method", "route", "code"],
  buckets: [0.1, 0.5, 1, 2, 5],
});
register.registerMetric(httpRequestDuration);

// Middleware para medir el tiempo de respuesta
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on("finish", () => {
    // Registramos la métrica cuando la respuesta termina
    end({
      method: req.method,
      route: req.route?.path || req.path,
      code: res.statusCode,
    });
  });
  next();
});

// Endpoint para que Prometheus lea las métricas
app.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", register.contentType);
  res.send(await register.metrics());
});
// --------------------------------

// --- SEGURIDAD ---
const jwtCheck = auth({
  audience: "account",
  issuerBaseURL: "http://keycloak:8080/realms/alquiler-realm",
  issuer: "http://localhost:8080/realms/alquiler-realm",
  tokenSigningAlg: "RS256",
});

// Swagger
const swaggerDocument = yaml.load(path.join(__dirname, "../openapi.yaml"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = process.env.API_PORT || 3000;

app.get("/health", (req, res) =>
  res.json({ status: "ok", service: "alquiler-api" })
);

app.get("/api/vehiculos", (req, res) => {
  res.json([
    { id: "1", patente: "AB123CD", modelo: "Yaris", estado: "disponible" },
  ]);
});

// RUTAS PROTEGIDAS
app.post("/api/vehiculos", jwtCheck, (req, res) => {
  res.status(201).json({ ...req.body, id: "99" });
});

app.post("/api/reservas", jwtCheck, (req, res) => {
  res.status(201).json({ id: "RES-123", estado: "pendiente", ...req.body });
});

app.post("/api/reservas/:id/confirmar", jwtCheck, async (req, res) => {
  const { id } = req.params;

  // Enviamos el evento a la cola
  await publishMessage({
    reservationId: id,
    action: "CONFIRMAR_RESERVA",
    timestamp: new Date().toISOString(),
  });

  res.status(202).json({
    reservationId: id,
    status: "verificacion_pendiente",
    message: "La solicitud ha sido encolada para procesamiento.",
  });
});

app.listen(PORT, async () => {
  console.log(`API listening on :${PORT}`);
  await connectBroker();
});
