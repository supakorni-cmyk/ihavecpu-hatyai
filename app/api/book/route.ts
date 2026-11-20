// app/api/book/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getCloudBookings, saveCloudBookings } from '@/app/lib/store';

export async function POST(req: Request) {
  try {
    const { spotIds, email, brand, ccEmails } = await req.json();

    if (!spotIds || !Array.isArray(spotIds) || spotIds.length === 0 || !email || !brand) {
      return NextResponse.json({ message: 'Spot selections, email, and brand name are required.' }, { status: 400 });
    }

    const adSpots = await getCloudBookings();

    // Verify availability
    for (const item of spotIds) {
      const spot = adSpots?.[item.zoneId]?.spots?.[item.spotId];
      if (spot && spot.status === 'Booked') {
        return NextResponse.json({ message: `Position "${spot.name || item.spotId}" is already booked.` }, { status: 409 });
      }
    }

    const bookedSpotsDetails: { name: string; price: number }[] = [];
    let subtotal = 0;

    spotIds.forEach((item: { zoneId: string; spotId: string; name?: string; price?: number }) => {
      if (!adSpots[item.zoneId]) adSpots[item.zoneId] = { spots: {} };
      if (!adSpots[item.zoneId].spots[item.spotId]) {
        adSpots[item.zoneId].spots[item.spotId] = { name: item.name || item.spotId, price: item.price || 0 };
      }

      const spot = adSpots[item.zoneId].spots[item.spotId];
      spot.status = 'Booked';
      spot.bookedBy = email;
      spot.brand = brand;
      bookedSpotsDetails.push({ name: spot.name, price: spot.price });
      subtotal += spot.price;
    });

    // Save to Cloud
    await saveCloudBookings(adSpots);

    // Email logic
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
    });

    let discountAmount = 0;
    if (bookedSpotsDetails.length === 2) discountAmount = 5000;
    else if (bookedSpotsDetails.length >= 3) discountAmount = 10000;

    const spotsListHtml = bookedSpotsDetails.map((s) => `<li>${s.name}</li>`).join('');
    
    const adminCCs = 'panarin.b@ihavecpu.com, sompong@ihavecpu.com, jittikorn.m@ihavecpu.com, kittichai.r@ihavecpu.com, setthinat.s@ihavecpu.com, attapon.p@ihavecpu.com, sutharat@ihavecpu.com, sophisa.p@ihavecpu.com, supakorn.i@ihavecpu.com, account@ihavecpu.com';
    let finalCCList = adminCCs;
    if (ccEmails && typeof ccEmails === 'string' && ccEmails.trim() !== '') {
      finalCCList += `, ${ccEmails.trim()}`;
    }

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

    return NextResponse.json({ success: true, message: 'All selected positions have been booked successfully!' });
  } catch (error: any) {
    console.error('Booking Error:', error);
    return NextResponse.json({ message: `An error occurred: ${error.message}` }, { status: 500 });
  }
}