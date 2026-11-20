// app/api/spots/route.ts
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'bookings.json');

export async function GET() {
  try {
    const fileContents = await fs.readFile(DATA_FILE_PATH, 'utf8');
    const bookings = JSON.parse(fileContents);
    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    // If the file does not exist yet, return an empty bookings object
    return NextResponse.json({ success: true, bookings: {} });
  }
}