// app/api/book/route.ts
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

// Define the path to our local JSON database file
const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'bookings.json');

// Helper: Read bookings from local JSON file
async function getLocalBookings(): Promise<Record<string, any>> {
  try {
    const fileContents = await fs.readFile(DATA_FILE_PATH, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    // If the file doesn't exist or is empty, return an empty object
    return {};
  }
}

// Helper: Save updated bookings to local JSON file
async function saveLocalBookings(data: Record<string, any>): Promise<void> {
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
}

export async function POST(req: Request) {
  try {
    // 1. Destructure spot selections along with email, brand, and ccEmails
    const { spotIds, email, brand, ccEmails } = await req.json();

    // 2. Validate required fields[cite: 1]
    if (!spotIds || !Array.isArray(spotIds) || spotIds.length === 0 || !email || !brand) {
      return NextResponse.json(
        { message: 'Spot selections, email, and brand name are required.' },
        { status: 400 }
      );
    }

    // 3. Retrieve current bookings from our local JSON file
    const adSpots = await getLocalBookings();

    // 4. Verify that each requested spot is valid and still available[cite: 1]
    for (const item of spotIds) {
      const spot = adSpots?.[item.zoneId]?.spots?.[item.spotId];
      if (spot && spot.status === 'Booked') {
        return NextResponse.json(
          { message: `Position "${spot.name || item.spotId}" is already booked.` },
          { status: 409 }
        );
      }
    }

    // 5. Mark spots as booked and calculate subtotal[cite: 1]
    const bookedSpotsDetails: { name: string; price: number }[] = [];
    let subtotal = 0;

    spotIds.forEach((item: { zoneId: string; spotId: string; name?: string; price?: number }) => {
      // Ensure zone structure exists before assigning
      if (!adSpots[item.zoneId]) {
        adSpots[item.zoneId] = { spots: {} };
      }
      if (!adSpots[item.zoneId].spots[item.spotId]) {
        adSpots[item.zoneId].spots[item.spotId] = {
          name: item.name || item.spotId,
          price: item.price || 0,
        };
      }

      const spot = adSpots[item.zoneId].spots[item.spotId];
      spot.status = 'Booked';
      spot.bookedBy = email;
      spot.brand = brand;
      bookedSpotsDetails.push({ name: spot.name, price: spot.price });
      subtotal += spot.price;
    });

    // Save updated records back to data/bookings.json
    await saveLocalBookings(adSpots);

    // 6. Configure Nodemailer Gmail transport[cite: 1]
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // 7. Calculate multi-spot discount logic[cite: 1]
    let discountAmount = 0;
    if (bookedSpotsDetails.length === 2) {
      discountAmount = 5000;
    } else if (bookedSpotsDetails.length >= 3) {
      discountAmount = 10000;
    }

    const spotsListHtml = bookedSpotsDetails
      .map((s) => `<li>${s.name}</li>`)
      .join('');

    // 8. Combine internal admin CCs with user-provided CC emails[cite: 1]
    const adminCCs =
      'panarin.b@ihavecpu.com, sompong@ihavecpu.com, jittikorn.m@ihavecpu.com, kittichai.r@ihavecpu.com, setthinat.s@ihavecpu.com, attapon.p@ihavecpu.com, sutharat@ihavecpu.com, sophisa.p@ihavecpu.com, supakorn.i@ihavecpu.com, account@ihavecpu.com';
    let finalCCList = adminCCs;
    if (ccEmails && typeof ccEmails === 'string' && ccEmails.trim() !== '') {
      finalCCList += `, ${ccEmails.trim()}`;
    }

    // 9. Prepare and send confirmation email[cite: 1]
    const mailOptions = {
      from: `"iHAVECPU Marketing" <${process.env.GMAIL_USER}>`,
      to: email,
      cc: finalCCList,
      subject: `[ iHAVECPU x ${brand} ] Booking Confirmation at iHAVECPU Hat Yai`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; color: #1a1a1a;">
          <h1>Thank you!</h1>
          <p>Booking for brand "<strong>${brand}</strong>" completed.</p>
          <h3>Positions:</h3>
          <ul>${spotsListHtml}</ul>
          <hr style="border: none; border-top: 1px solid #e5e7eb;" />
          <h3>Please wait for our confirmation email.</h3>
          <br />
          <p>Sincerely,<br />iHAVECPU Marketing</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: 'All selected positions have been booked successfully!',
    });
  } catch (error: any) {
    console.error('Booking Error:', error);
    return NextResponse.json(
      { message: `An error occurred: ${error.message}` },
      { status: 500 }
    );
  }
}