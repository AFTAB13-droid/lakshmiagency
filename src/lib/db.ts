import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/lakshmi_agency";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached?.conn) {
    return cached.conn;
  }

  if (!cached?.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10, // Optimal for serverless environments (prevents Atlas connection exhaustion)
      minPoolSize: 0,  // Allows idle connections to be cleanly reclaimed
      serverSelectionTimeoutMS: 5000, // Fail fast in 5s if Atlas is unreachable instead of hanging 30s
      socketTimeoutMS: 45000, // Close inactive sockets after 45s
      connectTimeoutMS: 10000, // 10s connection establishment timeout
      family: 4, // Force IPv4 to prevent dual-stack DNS resolution latency
      autoIndex: process.env.NODE_ENV !== "production", // Skip index building on cold starts in production
    };

    cached!.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      return m;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}

export default connectToDatabase;
