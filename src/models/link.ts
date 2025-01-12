import { Schema, model } from 'mongoose';

type LinkModel = {
  shortId: string;
  target: string;
};

const modelSchema = new Schema<LinkModel>({
  shortId: { type: String, required: true },
  target: { type: String, required: true },
});

export const LinkModel = model<LinkModel>('Link', modelSchema);
