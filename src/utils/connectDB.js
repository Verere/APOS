import mongoose from "mongoose";

const MONGODB_CONNECT_OPTIONS = {
  serverSelectionTimeoutMS: 2500,
  connectTimeoutMS: 2500,
  socketTimeoutMS: 8000,
  maxPoolSize: 10,
  minPoolSize: 1,
  family: 4,
  bufferCommands: false,
};

let connectionPromise = null;

function buildDbError(error) {
  const reason = String(error?.message || error || 'Unknown database error');
  const wrapped = new Error(`Database connection failed: ${reason}`);
  wrapped.code = error?.code || 'DB_CONNECT_FAILED';
  wrapped.cause = error;
  return wrapped;
}

const connectToDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    if (!process.env.MONGODB_URL) {
      throw new Error('MONGODB_URL is not configured');
    }

    if (!connectionPromise) {
      connectionPromise = mongoose.connect(process.env.MONGODB_URL, MONGODB_CONNECT_OPTIONS);
    }

    await connectionPromise;
    return mongoose.connection;
  } catch (error) {
    connectionPromise = null;
    console.log(`error from db connection ${error?.message || error}`);
    throw buildDbError(error);
  }
};

export default connectToDB;

