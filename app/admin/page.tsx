// app/admin/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// Helper interface for our aggregated brand data
interface BrandStat {
  brandName: string;
  totalSpent: number;
  spotCount: number;
  zones: Set<string>;
}

export default function AdminDashboardPage() {
  // --- UI State ---
  const [activeTab, setActiveTab] = useState<'RANKINGS' | 'BOOKINGS' | 'DISCOUNT'>('BOOKINGS');
  
  // --- Form State ---
  const [formData, setFormData] = useState({ adminPass: '', brandName: '', moreDiscount: '' });
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // --- Data State ---
  const [bookingsData, setBookingsData] = useState<Record<string, any>>({});
  const [refreshKey, setRefreshKey] = useState(0);

  // --- Fetch Data ---
  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch('/api/spots');
      const data = await res.json();
      if (data.success && data.bookings) {
        setBookingsData(data.bookings);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [refreshKey, fetchBookings]);

  // --- Aggregation: Get Flat List of Booked Spots ---
  const getBookedSpotsList = () => {
    const list = [];
    for (const [zoneId, zoneData] of Object.entries(bookingsData)) {
      if (zoneData.spots) {
        for (const [spotId, spot] of Object.entries(zoneData.spots as Record<string, any>)) {
          if (spot.status === 'Booked') {
            list.push({
              zoneId,
              spotId,
              name: spot.name,
              brand: spot.brand,
              bookedBy: spot.bookedBy,
              price: spot.price || 0,
              manualDiscount: spot.manualDiscount || 0,
            });
          }
        }
      }
    }
    return list;
  };

  // --- Aggregation: Get Ranked Brands ---
  const getBrandRankings = () => {
    const brandStats: Record<string, BrandStat> = {};

    for (const [zoneId, zoneData] of Object.entries(bookingsData)) {
      if (zoneData.spots) {
        for (const [spotId, spot] of Object.entries(zoneData.spots as Record<string, any>)) {
          if (spot.status === 'Booked' && spot.brand) {
            const brandKey = spot.brand.toUpperCase();

            if (!brandStats[brandKey]) {
              brandStats[brandKey] = {
                brandName: spot.brand,
                totalSpent: 0,
                spotCount: 0,
                zones: new Set(),
              };
            }

            const netPrice = (spot.price || 0) - (spot.manualDiscount || 0);
            
            brandStats[brandKey].spotCount += 1;
            brandStats[brandKey].totalSpent += netPrice;
            brandStats[brandKey].zones.add(zoneId);
          }
        }
      }
    }

    return Object.values(brandStats).sort((a, b) => b.totalSpent - a.totalSpent);
  };

  // --- Handle Manual Discount Submission ---
  const handleApplyDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    try {
      const response = await fetch('/api/admin/discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPass: formData.adminPass,
          brandName: formData.brandName,
          moreDiscount: Number(formData.moreDiscount),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatusMsg({ type: 'success', text: result.message });
        setFormData({ ...formData, brandName: '', moreDiscount: '' });
        setRefreshKey((prev) => prev + 1);
      } else {
        setStatusMsg({ type: 'error', text: result.message || 'Failed to apply discount.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // --- NEW: Handle Removing a Booking ---
  const handleRemoveBooking = async (zoneId: string, spotId: string, brandName: string) => {
    // 1. Ask for confirmation before deleting
    const isConfirmed = window.confirm(`Are you sure you want to remove the booking for ${spotId} (${brandName})? This will make the spot available again.`);
    if (!isConfirmed) return;

    try {
      // 2. Call the toggle endpoint. Because it is currently booked, this endpoint will delete the record.
      const response = await fetch('/api/spots/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zoneId,
          spotId,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // 3. Refresh the tables instantly to reflect the removal
        setRefreshKey((prev) => prev + 1);
        alert(`Successfully removed booking for ${spotId}.`);
      } else {
        alert(result.message || 'Failed to remove booking.');
      }
    } catch (err) {
      console.error('Remove error:', err);
      alert('Network error while removing booking.');
    }
  };

  const bookedSpots = getBookedSpotsList();
  const rankedBrands = getBrandRankings();

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 font-sans flex flex-col items-center pt-16 px-6 pb-20">
      
      {/* Header */}
      <div className="w-full max-w-5xl mb-8">
        <Link href="/" className="text-sm text-neutral-400 hover:text-white transition inline-block mb-4">
          &larr; Back to Main Site
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-sm text-neutral-400">
          Manage reservations, track brand placements, and apply manual discounts.
        </p>
      </div>

      {/* Tabs */}
      <div className="w-full max-w-5xl flex border-b border-neutral-800 mb-6">
        <button
          onClick={() => setActiveTab('RANKINGS')}
          className={`px-6 py-3 text-sm font-bold transition ${activeTab === 'RANKINGS' ? 'text-red-500 border-b-2 border-red-500 bg-red-500/10' : 'text-neutral-400 hover:bg-neutral-900'}`}
        >
          Brand Rankings
        </button>
        <button
          onClick={() => setActiveTab('BOOKINGS')}
          className={`px-6 py-3 text-sm font-bold transition ${activeTab === 'BOOKINGS' ? 'text-red-500 border-b-2 border-red-500 bg-red-500/10' : 'text-neutral-400 hover:bg-neutral-900'}`}
        >
          Booked Spots
        </button>
        <button
          onClick={() => setActiveTab('DISCOUNT')}
          className={`px-6 py-3 text-sm font-bold transition ${activeTab === 'DISCOUNT' ? 'text-red-500 border-b-2 border-red-500 bg-red-500/10' : 'text-neutral-400 hover:bg-neutral-900'}`}
        >
          Apply Discount
        </button>
      </div>

      <div className="w-full max-w-5xl">
        
        {/* --- VIEW 1: BRAND RANKINGS --- */}
        {activeTab === 'RANKINGS' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
              <h2 className="text-lg font-bold">Top Sponsors Leaderboard</h2>
              <span className="text-xs font-mono bg-neutral-800 px-3 py-1 rounded text-neutral-300">
                {rankedBrands.length} Brands Total
              </span>
            </div>
            
            {rankedBrands.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 text-sm">No active bookings found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-950 text-xs uppercase tracking-wider text-neutral-500">
                      <th className="p-4 border-b border-neutral-800">Rank</th>
                      <th className="p-4 border-b border-neutral-800">Brand Name</th>
                      <th className="p-4 border-b border-neutral-800 text-center">Spots Booked</th>
                      <th className="p-4 border-b border-neutral-800">Zones Activating</th>
                      <th className="p-4 border-b border-neutral-800 text-right">Total Value (THB)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankedBrands.map((brand, index) => (
                      <tr key={brand.brandName} className="hover:bg-neutral-800/50 transition border-b border-neutral-800/50 last:border-0">
                        <td className="p-4 font-mono font-bold text-red-500">#{index + 1}</td>
                        <td className="p-4 font-bold text-white">{brand.brandName}</td>
                        <td className="p-4 text-center text-neutral-300">{brand.spotCount}</td>
                        <td className="p-4 text-xs text-neutral-400">
                          {Array.from(brand.zones).map(z => z.replace('LightBox', ' Lightbox')).join(', ')}
                        </td>
                        <td className="p-4 text-right font-mono font-bold text-amber-500">
                          {brand.totalSpent.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

{/* --- VIEW 2: BOOKED SPOTS LIST --- */}
        {activeTab === 'BOOKINGS' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
              <h2 className="text-lg font-bold">All Reserved Placements</h2>
              <span className="text-xs font-mono bg-neutral-800 px-3 py-1 rounded text-neutral-300">
                {bookedSpots.length} Spots Active
              </span>
            </div>
            
            {bookedSpots.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 text-sm">No spots have been booked yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-950 text-xs uppercase tracking-wider text-neutral-500">
                      <th className="p-4 border-b border-neutral-800">Spot Code</th>
                      {/* NEW: Spot Title Header */}
                      <th className="p-4 border-b border-neutral-800">Spot Title</th>
                      <th className="p-4 border-b border-neutral-800">Zone</th>
                      <th className="p-4 border-b border-neutral-800">Brand</th>
                      <th className="p-4 border-b border-neutral-800">Booked By (Email)</th>
                      <th className="p-4 border-b border-neutral-800 text-right">Net Price</th>
                      <th className="p-4 border-b border-neutral-800 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookedSpots.map((spot, i) => (
                      <tr key={i} className="hover:bg-neutral-800/50 transition border-b border-neutral-800/50 last:border-0">
                        <td className="p-4 font-mono text-amber-500 font-bold">{spot.spotId}</td>
                        {/* NEW: Spot Title Cell */}
                        <td className="p-4 text-sm font-medium text-neutral-200">{spot.name}</td>
                        <td className="p-4 text-xs text-neutral-300">{spot.zoneId}</td>
                        <td className="p-4 font-bold text-white">{spot.brand}</td>
                        <td className="p-4 text-xs text-neutral-400">{spot.bookedBy}</td>
                        <td className="p-4 text-right">
                          <div className="font-mono text-sm font-bold text-white">
                            {(spot.price - spot.manualDiscount).toLocaleString()} THB
                          </div>
                          {spot.manualDiscount > 0 && (
                            <div className="text-[10px] text-emerald-400">
                              (-{spot.manualDiscount.toLocaleString()} THB Discount)
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleRemoveBooking(spot.zoneId, spot.spotId, spot.brand)}
                            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-semibold px-3 py-1.5 rounded text-xs border border-rose-500/30 transition"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* --- VIEW 3: APPLY MANUAL DISCOUNT --- */}
        {activeTab === 'DISCOUNT' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl max-w-md mx-auto">
            <h2 className="text-lg font-bold mb-6 border-b border-neutral-800 pb-4">Apply Manual Discount</h2>
            <form onSubmit={handleApplyDiscount} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5 uppercase tracking-wider">
                  Admin Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.adminPass}
                  onChange={(e) => setFormData({ ...formData, adminPass: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition"
                  placeholder="••••••••"
                />
              </div>

              <div className="h-px bg-neutral-800/60 my-6"></div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5 uppercase tracking-wider">
                  Target Brand Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition"
                  placeholder="e.g., ASUS"
                />
                <p className="text-[10px] text-neutral-500 mt-1">Check the "Brand Rankings" tab for exact spelling.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5 uppercase tracking-wider">
                  Discount Amount (THB)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.moreDiscount}
                  onChange={(e) => setFormData({ ...formData, moreDiscount: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition"
                  placeholder="e.g., 5000"
                />
              </div>

              {statusMsg && (
                <div className={`p-4 rounded-lg text-sm font-medium ${
                  statusMsg.type === 'success' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}>
                  {statusMsg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-500 hover:bg-red-400 text-neutral-950 font-bold px-6 py-3 rounded-lg text-sm transition disabled:opacity-50 mt-4"
              >
                {loading ? 'Processing...' : 'Apply Brand Discount'}
              </button>
            </form>
          </div>
        )}

      </div>
    </main>
  );
}