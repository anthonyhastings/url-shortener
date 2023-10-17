import mongoose from 'mongoose';

export const LinkModel = mongoose.model(
  'Link',
  new mongoose.Schema({
    shortId: String,
    target: String,
  }),
);
