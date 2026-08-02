import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectMongoDB from '@/lib/db';

export async function GET() {
  try {
    await connectMongoDB();
    await mongoose.connection.db?.admin().ping();

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        message: 'Database unavailable',
      },
      { status: 503 },
    );
  }
}
