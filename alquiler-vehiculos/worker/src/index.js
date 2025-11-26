import amqp from "amqplib";
import pg from "pg";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { Pool } = pg;

// --- CONFIGURACIÓN gRPC ---
const PROTO_PATH = path.join(__dirname, "inventario.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const inventarioProto =
  grpc.loadPackageDefinition(packageDefinition).inventario.v1;
const GRPC_HOST = process.env.GRPC_HOST || "localhost:50051";
const inventoryClient = new inventarioProto.InventarioService(
  GRPC_HOST,
  grpc.credentials.createInsecure()
);

// Helper para prometer la llamada gRPC (que usa callbacks)
const checkInventory = (vehiculoId) => {
  return new Promise((resolve, reject) => {
    inventoryClient.CheckAndBlock({ vehiculoId }, (err, response) => {
      if (err) reject(err);
      else resolve(response);
    });
  });
};
// --------------------------

const RABBIT_HOST = process.env.RABBIT_HOST || "rabbitmq";
const QUEUE_NAME = "reservas-confirmacion";

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST || "db",
  database: process.env.POSTGRES_DB,
  port: 5432,
});

const processReserva = async (msg) => {
  const content = JSON.parse(msg.content.toString());
  console.log(`📥 [Worker] Procesando reserva: ${content.reservationId}`);

  try {
    // 1. LLAMADA gRPC A INVENTARIO
    console.log(`📞 Consultando stock en Inventario (gRPC)...`);
    const stock = await checkInventory(content.vehiculoId || "v-default");

    if (stock.ok) {
      // 2. Si hay stock, Confirmar
      await pool.query(
        "UPDATE reserva SET estado = 'confirmada', bloque_id = $1 WHERE id = $2",
        [stock.bloqueId, content.reservationId]
      );
      console.log(`✅ Reserva confirmada. Bloque ID: ${stock.bloqueId}`);
    } else {
      // 3. Si NO hay stock, Rechazar
      await pool.query(
        "UPDATE reserva SET estado = 'rechazada' WHERE id = $1",
        [content.reservationId]
      );
      console.log(`🚫 Reserva rechazada. Razón: ${stock.reason}`);
    }
  } catch (error) {
    console.error(`❌ Error en worker:`, error.message);
  }
};

const startWorker = async () => {
  try {
    const connection = await amqp.connect(`amqp://guest:guest@${RABBIT_HOST}`);
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    channel.prefetch(1);
    console.log(`🚀 Worker conectado a RabbitMQ y gRPC (${GRPC_HOST})`);
    channel.consume(QUEUE_NAME, async (msg) => {
      if (msg) {
        await processReserva(msg);
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error("❌ Error de conexión, reintentando...", error.message);
    setTimeout(startWorker, 5000);
  }
};

startWorker();
