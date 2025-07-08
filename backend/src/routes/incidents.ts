import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createIncident,
  listIncidents,
  summarizeIncident,
} from '../controllers/incidentController';

const router = Router();

router.post('/incidents', authenticate, createIncident);
router.get('/incidents', authenticate, listIncidents);
router.post('/incidents/:id/summarize', authenticate, summarizeIncident);

export default router;