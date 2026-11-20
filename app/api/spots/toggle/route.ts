// app/api/spots/toggle/route.ts
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Point to our local JSON file database
const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'bookings.json');

// Helper to read current bookings from the JSON file
async function getLocalBookings(): Promise<Record<string, any>> {
  try {
    const fileContents = await fs.readFile(DATA_FILE_PATH, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    return {};
  }
}

// Helper to write updated bookings to the JSON file
async function saveLocalBookings(data: Record<string, any>): Promise<void> {
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
}

export async function POST(req: Request) {
  try {
    const { zoneId, spotId, name, price } = await req.json();

    if (!zoneId || !spotId) {
      return NextResponse.json(
        { message: 'Zone ID and Spot ID are required.' },
        { status: 400 }
      );
    }

    // 1. Read existing bookings
    const adSpots = await getLocalBookings();

    // Ensure the zone object exists
    if (!adSpots[zoneId]) {
      adSpots[zoneId] = { spots: {} };
    }
    if (!adSpots[zoneId].spots) {
      adSpots[zoneId].spots = {};
    }

    const currentSpot = adSpots[zoneId].spots[spotId];
    const isCurrentlyBooked = currentSpot && currentSpot.status === 'Booked';

    if (isCurrentlyBooked) {
      // 2A. If already booked, remove/reset it so it becomes Available again
      delete adSpots[zoneId].spots[spotId];
    } else {
      // 2B. If currently available, mark it as Booked by Admin
      adSpots[zoneId].spots[spotId] = {
        name: name || spotId,
        price: price || 0,
        status: 'Booked',
        bookedBy: 'Admin (Manual Toggle)',
        brand: 'Reserved by Admin',
      };
    }

    // 3. Save changes to data/bookings.json
    await saveLocalBookings(adSpots);

    return NextResponse.json({
      success: true,
      message: `Spot ${spotId} status toggled successfully.`,
      newStatus: isCurrentlyBooked ? 'AVAILABLE' : 'BOOKED',
    });
  } catch (error: any) {
    console.error('Toggle Error:', error);
    return NextResponse.json(
      { message: `An error occurred: ${error.message}` },
      { status: 500 }
    );
  }
}