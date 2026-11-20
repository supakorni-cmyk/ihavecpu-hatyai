// app/api/admin/discount/route.ts
import { NextResponse } from 'next/server';
import { getCloudBookings, saveCloudBookings } from '@/app/lib/store';

export async function POST(req: Request) {
  try {
    const { adminPass, brandName, moreDiscount } = await req.json();

    if (adminPass !== process.env.ADMIN_PASS) {
      return NextResponse.json({ message: 'Unauthorized: Invalid Admin Password.' }, { status: 401 });
    }

    if (!brandName || moreDiscount === undefined) {
      return NextResponse.json({ message: 'Brand name and discount amount are required.' }, { status: 400 });
    }

    const adSpots = await getCloudBookings();
    let spotsFound = 0;

    for (const zoneId in adSpots) {
      for (const spotId in adSpots[zoneId].spots) {
        const spot = adSpots[zoneId].spots[spotId];
        
        if (spot.brand && spot.brand.toLowerCase() === brandName.toLowerCase()) {
          spot.manualDiscount = parseFloat(moreDiscount) || 0;
          spotsFound++;
        }
      }
    }

    if (spotsFound === 0) {
      return NextResponse.json({ message: `No bookings found for brand: ${brandName}` }, { status: 404 });
    }

    await saveCloudBookings(adSpots);

    return NextResponse.json({
      success: true,
      message: `Successfully applied a ${moreDiscount} THB discount to ${spotsFound} spot(s) for ${brandName}.`,
    });
  } catch (error: any) {
    return NextResponse.json({ message: `Server error: ${error.message}` }, { status: 500 });
  }
}