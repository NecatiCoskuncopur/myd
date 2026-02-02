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
  mongoose?: MongooseCache;
};

const connectMongoDB = async (): Promise<typeof mongoose> => {
  if (globalForMongoose.mongoose?.conn) {
    return globalForMongoose.mongoose.conn;
  }

  if (!globalForMongoose.mongoose) {
    globalForMongoose.mongoose = {
      conn: null,
      promise: null,
    };
  }

  if (!globalForMongoose.mongoose.promise) {
    globalForMongoose.mongoose.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  globalForMongoose.mongoose.conn = await globalForMongoose.mongoose.promise;

  return globalForMongoose.mongoose.conn;
};

export default connectMongoDB;
