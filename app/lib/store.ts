// app/lib/store.ts
import { getStore } from '@netlify/blobs';

// Helper: Fetch bookings from Netlify Blobs
export async function getCloudBookings(): Promise<Record<string, any>> {
  try {
    // Connect to the "spots" blob store
    const spotsStore = getStore('spots');
    
    // Retrieve the data, explicitly parsing it as JSON
    const data = await spotsStore.get('spots-data', { type: 'json' });
    
    // Return the data, or an empty object if it doesn't exist yet
    return data || {};
  } catch (error) {
    console.error('Error reading from Netlify Blobs:', error);
    return {};
  }
}

// Helper: Save updated bookings to Netlify Blobs
export async function saveCloudBookings(data: Record<string, any>): Promise<void> {
  try {
    const spotsStore = getStore('spots');
    await spotsStore.setJSON('spots-data', data);
  } catch (error) {
    console.error('Error writing to Netlify Blobs:', error);
    throw new Error('Failed to save data to the cloud.');
  }
}