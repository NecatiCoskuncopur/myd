import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';

export async function GET() {
  const result = {
    connection: false,
    ping: false,
    write: false,
    delete: false,
  };

  try {
    await connectMongoDB();

    const db = mongoose.connection.db;

    if (!db) {
      captureActionError('healthCheck.databaseUnavailable', new Error('Database connection unavailable'));

      return NextResponse.json(
        {
          status: 'error',
          timestamp: new Date().toISOString(),
          database: result,
        },
        { status: 503 },
      );
    }

    result.connection = true;

    await db.admin().ping();
    result.ping = true;

    const collection = db.collection('health_check');
    const testId = new mongoose.Types.ObjectId();

    await collection.insertOne({
      _id: testId,
      createdAt: new Date(),
    });

    result.write = true;

    await collection.deleteOne({
      _id: testId,
    });

    result.delete = true;

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: result,
    });
  } catch (error) {
    captureActionError('healthCheck', error, {
      extras: {
        database: result,
      },
    });

    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: result,
      },
      { status: 503 },
    );
  }
}
