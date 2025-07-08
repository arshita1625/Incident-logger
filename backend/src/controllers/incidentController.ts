import { Request, Response } from 'express';
import { Incident } from '../models/incident';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function createIncident(req: Request, res: Response) {
  const { type, description } = req.body;
  const userId = (req as any).uid;
  const incident = await Incident.create({ userId, type, description });
  return res.status(201).json(incident);
}

export async function listIncidents(req: Request, res: Response) {
  const userId = (req as any).uid;
  const incidents = await Incident.findAll({ where: { userId } });
  return res.json(incidents);
}

export async function summarizeIncident(req: Request, res: Response) {
  const { id } = req.params;
  const incident = await Incident.findByPk(id);
  if (!incident) return res.status(404).json({ error: 'Not found' });
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'Summarize the following incident.' },
      { role: 'user', content: incident.description }
    ]
  });
  const summary = response.choices[0].message.content;
  incident.summary = summary || "";
  await incident.save();
  return res.json({ summary });
}