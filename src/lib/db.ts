import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalForMongoose = globalThis as typeof globalThis & {
  _mongoose?: MongooseCache;
};

const cached: MongooseCache = globalForMongoose._mongoose ?? {
  conn: null,
  promise: null,
};

globalForMongoose._mongoose = cached;

const connectMongoDB = async (): Promise<typeof mongoose> => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;

  return cached.conn;
};

export default connectMongoDB;
