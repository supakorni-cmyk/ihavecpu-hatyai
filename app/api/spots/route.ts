// app/api/spots/route.ts
import { NextResponse } from 'next/server';
import { getCloudBookings } from '@/app/lib/store';

export async function GET() {
  try {
    const bookings = await getCloudBookings();
    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    return NextResponse.json({ success: true, bookings: {} });
  }
}