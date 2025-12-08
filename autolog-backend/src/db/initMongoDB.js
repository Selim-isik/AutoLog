import mongoose from 'mongoose';

export const initMongoDB = async () => {
  try {
    const { MONGO_URL } = process.env;

    if (!MONGO_URL) {
      throw new Error('MONGO_URL is missing from environment variables!');
    }

    await mongoose.connect(MONGO_URL);
    console.log('Mongo connection successfully established!');
  } catch (e) {
    console.log('Error while setting up mongo connection', e);
    throw e;
  }
};
