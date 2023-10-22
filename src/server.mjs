import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import { nanoid } from 'nanoid';
import { config } from './config.mjs';
import { LinkModel } from './models/link.mjs';
import { isValidHTTPURL } from './utils.mjs';

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.once('disconnected', () => {
  console.log('Disconnected from MongoDB');
});

try {
  await mongoose.connect(config.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
} catch (error) {
  console.log('Mongoose connection failed:', error);
  process.exit(1);
}

export const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/links/:shortId', async (req, res) => {
  const link = await LinkModel.findOne({ shortId: req.params.shortId });

  if (link === null) {
    return res.status(404).json({ success: false, error: 'Record not found' });
  }

  res.status(200).json({ success: true, data: link.toJSON() });
});

app.post('/links', async (req, res) => {
  const isValidTarget = isValidHTTPURL(req.body.target);
  if (!isValidTarget) {
    return res.status(409).json({ success: false, error: 'Invalid target' });
  }

  const shortId = nanoid(25);

  const existingLink = await LinkModel.findOne({ shortId });
  if (existingLink) {
    return res
      .status(409)
      .json({ success: false, error: 'Short Id already exists' });
  }

  const link = await new LinkModel({
    shortId,
    target: req.body.target,
  }).save();

  res.status(201).json({ success: true, data: link.toJSON() });
});

app.get('/:shortId', async (req, res) => {
  const link = await LinkModel.findOne({ shortId: req.params.shortId });

  if (link === null) {
    return res.status(404).json({ success: false, error: 'Record not found' });
  }

  res.redirect(301, link.target);
});
