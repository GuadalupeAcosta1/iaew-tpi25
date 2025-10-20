import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

const PORT = process.env.API_PORT || 3000;

app.get('/health', (req,res)=> res.json({status:'ok', service:'alquiler-api'}));

app.get('/api/vehiculos', (req,res)=> {
  res.json([
    {id:'00000000-0000-0000-0000-000000000001', patente:'AB123CD', marca:'Toyota', modelo:'Yaris', anio:2022, estado:'disponible'}
  ]);
});

app.post('/api/vehiculos', (req,res)=> {
  res.status(201).json({...req.body, id:'00000000-0000-0000-0000-000000000099'});
});

app.post('/api/reservas', (req,res)=> {
  const reserva = { id: '11111111-1111-1111-1111-111111111111', estado:'pendiente', ...req.body };
  res.status(201).json(reserva);
});

app.post('/api/reservas/:id/confirmar', async (req,res)=> {
  const { id } = req.params;
  res.status(202).json({ reservationId:id, status:'verificacion_pendiente' });
});


app.listen(PORT, ()=> console.log(`API listening on :${PORT}`));
