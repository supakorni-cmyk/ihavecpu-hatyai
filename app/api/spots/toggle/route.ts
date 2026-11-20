// app/api/spots/toggle/route.ts
import { NextResponse } from 'next/server';
import { getCloudBookings, saveCloudBookings } from '@/app/lib/store';

export async function POST(req: Request) {
  try {
    const { zoneId, spotId, name, price } = await req.json();

    if (!zoneId || !spotId) {
      return NextResponse.json({ message: 'Zone ID and Spot ID are required.' }, { status: 400 });
    }

    const adSpots = await getCloudBookings();

    if (!adSpots[zoneId]) adSpots[zoneId] = { spots: {} };
    if (!adSpots[zoneId].spots) adSpots[zoneId].spots = {};

    const currentSpot = adSpots[zoneId].spots[spotId];
    const isCurrentlyBooked = currentSpot && currentSpot.status === 'Booked';

    if (isCurrentlyBooked) {
      // Remove to make Available
      delete adSpots[zoneId].spots[spotId];
    } else {
      // Mark as Booked by Admin
      adSpots[zoneId].spots[spotId] = {
        name: name || spotId,
        price: price || 0,
        status: 'Booked',
        bookedBy: 'Admin (Manual Toggle)',
        brand: 'Reserved by Admin',
      };
    }

    // Save to cloud
    await saveCloudBookings(adSpots);

    return NextResponse.json({
      success: true,
      message: `Spot ${spotId} status toggled successfully.`,
      newStatus: isCurrentlyBooked ? 'AVAILABLE' : 'BOOKED',
    });
  } catch (error: any) {
    console.error('Toggle Error:', error);
    return NextResponse.json({ message: `An error occurred: ${error.message}` }, { status: 500 });
  }
}