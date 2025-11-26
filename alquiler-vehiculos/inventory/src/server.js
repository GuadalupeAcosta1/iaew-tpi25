import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Implementación de la lógica
const checkAndBlock = (call, callback) => {
  console.log(
    `🔎 [Inventario] Verificando vehículo: ${call.request.vehiculoId}`
  );

  // Simulamos lógica: Si el ID termina en '99', decimos que NO hay stock.
  const isAvailable = !call.request.vehiculoId.endsWith("99");

  if (isAvailable) {
    console.log("✅ Disponible. Bloqueado.");
    callback(null, { ok: true, bloqueId: "BLK-" + Date.now() });
  } else {
    console.log("❌ No disponible.");
    callback(null, { ok: false, reason: "Vehículo en mantenimiento" });
  }
};

const server = new grpc.Server();
server.addService(inventarioProto.InventarioService.service, {
  CheckAndBlock: checkAndBlock,
  ReleaseBlock: (call, cb) => cb(null, { ok: true }), // Dummy implementation
});

const PORT = "0.0.0.0:50051";
server.bindAsync(PORT, grpc.ServerCredentials.createInsecure(), () => {
  console.log(`📦 Servicio de Inventario gRPC corriendo en ${PORT}`);
});
