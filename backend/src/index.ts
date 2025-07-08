import express from 'express';
import dotenv from 'dotenv';
import { sequelize } from './config/database';
import incidentRoutes from './routes/incidents';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/api', incidentRoutes);

const port = process.env.PORT || 4000;
(async () => {
  await sequelize.sync();
  app.listen(port, () => console.log(`Server listening on ${port}`));
})();