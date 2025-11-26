import amqp from "amqplib";

let channel = null;
const QUEUE_NAME = "reservas-confirmacion";

export const connectBroker = async () => {
  try {
    // Usamos las variables de entorno o valores por defecto
    const user = process.env.RABBITMQ_DEFAULT_USER || "guest";
    const pass = process.env.RABBITMQ_DEFAULT_PASS || "guest";
    const host = "rabbitmq"; // Nombre del servicio en Docker Compose

    const connection = await amqp.connect(`amqp://${user}:${pass}@${host}`);
    channel = await connection.createChannel();

    // Aseguramos que la cola exista
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    console.log(`✅ Conectado a RabbitMQ. Cola: ${QUEUE_NAME}`);
  } catch (error) {
    console.error("❌ Error conectando a RabbitMQ:", error);
    // Reintentar en 5 segundos si falla al inicio
    setTimeout(connectBroker, 5000);
  }
};

export const publishMessage = async (data) => {
  if (!channel) {
    console.error("⚠️ No hay conexión con RabbitMQ");
    return false;
  }

  const msgBuffer = Buffer.from(JSON.stringify(data));
  channel.sendToQueue(QUEUE_NAME, msgBuffer, { persistent: true });
  console.log(`📨 Mensaje enviado a RabbitMQ:`, data);
  return true;
};
