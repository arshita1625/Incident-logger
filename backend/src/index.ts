import express from 'express';
import dotenv from 'dotenv';
import { sequelize } from './config/database';
import incidentRoutes from './routes/incidents';
import cors from 'cors';
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',  // allow local Next.js
  credentials: true,                // if you ever send cookies
}));
app.use(express.json());
app.use('/api', incidentRoutes);

const port = process.env.PORT || 4000;
(async () => {
  await sequelize.sync();
  app.listen(port, () => console.log(`Server listening on ${port}`));
})();
