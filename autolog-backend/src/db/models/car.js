import { model, Schema } from 'mongoose';

const carSchema = new Schema(
  {
    plate: {
      type: String,
      required: true,
      unique: true,
    },
    brand: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      default: '',
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    status: {
      type: String,
      enum: ['in-service', 'ready', 'delivered'],
      default: 'in-service',
    },
    history: [
      {
        description: { type: String, required: true },
        cost: { type: Number, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Car = model('cars', carSchema);
