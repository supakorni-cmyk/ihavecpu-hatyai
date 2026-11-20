// app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { AD_SLOTS, AdSlot } from './data/slots';
import Image from 'next/image';

const GALLERY_ITEMS = [
  { id: 1, title: 'Shop Layout', category: 'Layout', image: '/RENDER/VIEW/GALLERY/4.png' },
  { id: 2, title: 'Exterior Perspective', category: 'Exterior Perspective', image: '/RENDER/VIEW/GALLERY/1.png' },
  { id: 3, title: 'Exterior Perspective', category: 'Exterior Perspective', image: '/RENDER/VIEW/GALLERY/2.png' },
  { id: 4, title: 'Exterior Perspective', category: 'Exterior Perspective', image: '/RENDER/VIEW/GALLERY/3.png' },
  { id: 5, title: 'Cashier', category: 'Interior', image: '/RENDER/VIEW/GALLERY/5.png' },
  { id: 6, title: 'Monitor', category: 'Interior', image: '/RENDER/VIEW/GALLERY/6.png' },
  { id: 7, title: 'Assembly Area', category: 'Interior', image: '/RENDER/VIEW/GALLERY/7.png' },
  { id: 8, title: 'Overview', category: 'Interior', image: '/RENDER/VIEW/GALLERY/8.png' },
  { id: 9, title: 'Overview', category: 'Interior', image: '/RENDER/VIEW/GALLERY/9.png' },
  { id: 10, title: 'Overview', category: 'Interior', image: '/RENDER/VIEW/GALLERY/10.png' },
  { id: 11, title: 'Overview', category: 'Interior', image: '/RENDER/VIEW/GALLERY/11.png' },
  { id: 12, title: 'Overview', category: 'Interior', image: '/RENDER/VIEW/GALLERY/12.png' },
  { id: 13, title: 'Overview', category: 'Interior', image: '/RENDER/VIEW/GALLERY/13.png' },
];

const ZONE_LAYOUT_IMAGES: Record<string, string[]> = {
  exteriorLogo: [
    '/RENDER/VIEW/GALLERY/1.png', '/RENDER/VIEW/GALLERY/3.png'
  ],
  interiorLightBox: [
    '/RENDER/VIEW/14.png', '/RENDER/VIEW/15.png', '/RENDER/VIEW/16.png',
  ],
  tableLightBox: [
    '/RENDER/VIEW/GALLERY/12.png', '/RENDER/VIEW/GALLERY/13.png', '/RENDER/VIEW/GALLERY/11.png'
  ],
  interiorLogo: [
    '/RENDER/VIEW/GALLERY/13.png', '/RENDER/VIEW/GALLERY/12.png', '/RENDER/VIEW/GALLERY/11.png', '/RENDER/VIEW/GALLERY/10.png', '/RENDER/VIEW/GALLERY/9.png', '/RENDER/VIEW/GALLERY/7.png', '/RENDER/VIEW/GALLERY/6.png', '/RENDER/VIEW/GALLERY/5.png', '/RENDER/VIEW/GALLERY/3.png', '/RENDER/VIEW/GALLERY/2.png'
  ]
};

export default function AdsBookingPage() {
  // --- 1. Page State Management ---
  const [filter, setFilter] = useState<string>('exteriorLogo');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string; } | null>(null);
  
  // Zone Slider State
  const [activeSlide, setActiveSlide] = useState(0);
  
  // Gallery Slider State
  const [gallerySlide, setGallerySlide] = useState(0);

  // Dynamic slots list loaded from our local JSON database
  const [slots, setSlots] = useState<AdSlot[]>(AD_SLOTS);

  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  // --- Multi-Slot Selection State ---
  const [selectedSlots, setSelectedSlots] = useState<AdSlot[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);


  // --- 2. Booking Form State ---
  const [formData, setFormData] = useState({
    brand: '',
    email: '',
    ccEmails: '',
  });

  // --- 3. Safe Data Fetching Effect ---
  useEffect(() => {
    let isMounted = true; 

    const fetchAvailability = async () => {
      try {
        const res = await fetch('/api/spots');
        const data = await res.json();

        if (data.success && data.bookings && isMounted) {
          const updatedSlots = AD_SLOTS.map((slot) => {
            const isBooked = data.bookings[slot.zone]?.spots?.[slot.id]?.status === 'Booked';
            return {
              ...slot,
              status: isBooked ? 'Booked' : slot.status,
            };
          });
          setSlots(updatedSlots);
        }
      } catch (err) {
        console.error('Failed to fetch availability:', err);
      }
    };

    fetchAvailability();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  // --- 4. Tab & Slider Helpers ---
  const handleTabChange = (zone: string) => {
    setFilter(zone);
    setActiveSlide(0);
  };

  const handleNextSlide = () => {
    const maxSlides = ZONE_LAYOUT_IMAGES[filter]?.length || 0;
    if (maxSlides > 0) {
      setActiveSlide((prev) => (prev === maxSlides - 1 ? 0 : prev + 1));
    }
  };

  const handlePrevSlide = () => {
    const maxSlides = ZONE_LAYOUT_IMAGES[filter]?.length || 0;
    if (maxSlides > 0) {
      setActiveSlide((prev) => (prev === 0 ? maxSlides - 1 : prev - 1));
    }
  };

  // Gallery Slider Helpers
  const handleNextGallery = () => {
    setGallerySlide((prev) => (prev === GALLERY_ITEMS.length - 1 ? 0 : prev + 1));
  };

  const handlePrevGallery = () => {
    setGallerySlide((prev) => (prev === 0 ? GALLERY_ITEMS.length - 1 : prev - 1));
  };

  // --- 5. Multi-Select & Price Calculation Helpers ---
  const toggleSlotSelection = (slot: AdSlot) => {
    if (slot.status.toUpperCase() !== 'AVAILABLE' || isAdminMode) return;

    setSelectedSlots((prev) => {
      const exists = prev.some((item) => item.id === slot.id);
      if (exists) {
        return prev.filter((item) => item.id !== slot.id);
      }
      return [...prev, slot];
    });
  };

  const calculateTotals = () => {
    const subtotal = selectedSlots.reduce((sum, slot) => sum + slot.priceTHB, 0);
    let discount = 0;

    if (selectedSlots.length === 2) {
      discount = 5000;
    } else if (selectedSlots.length >= 3) {
      discount = 10000;
    }

    const total = subtotal - discount;
    return { subtotal, discount, total };
  };

  const { subtotal, discount, total } = calculateTotals();


  // --- 7. Modal Handlers ---
  const handleOpenModal = () => {
    if (selectedSlots.length === 0) return;
    setIsModalOpen(true);
    setStatusMsg(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setStatusMsg(null);
  };

  // --- 8. Booking Submission Handler ---
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSlots.length === 0) return;

    setLoading(true);
    setStatusMsg(null);

    try {
      const spotIdsPayload = selectedSlots.map((slot) => ({
        zoneId: slot.zone,
        spotId: slot.id,
        name: slot.title,
        price: slot.priceTHB,
      }));

      const response = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spotIds: spotIdsPayload,
          email: formData.email,
          brand: formData.brand,
          ccEmails: formData.ccEmails,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatusMsg({ type: 'success', text: result.message || 'All placements booked successfully!' });
        
        triggerRefresh(); 
        
        setTimeout(() => {
          setSelectedSlots([]);
          setFormData({ brand: '', email: '', ccEmails: '' });
          handleCloseModal();
        }, 2000);
      } else {
        setStatusMsg({ type: 'error', text: result.message || 'Submission failed. Please try again.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Network error. Please check your connection and try again.' });
    } finally {
      setLoading(false);
    }
  };

  const currentZoneImages = ZONE_LAYOUT_IMAGES[filter] || [];
  const activeGalleryItem = GALLERY_ITEMS[gallerySlide];

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 font-sans pb-32 selection:bg-amber-500 selection:text-neutral-950">
      {/* --- Admin Mode Notice Banner --- */}
      {isAdminMode && (
        <div className="bg-amber-500 text-neutral-950 px-6 py-2 text-center font-semibold text-xs tracking-wide flex items-center justify-center gap-2 shadow-lg animate-pulse sticky top-0 z-50">
          <span>🔐 ADMIN MODE ACTIVE — Click any status badge below to toggle between AVAILABLE and BOOKED</span>
        </div>
      )}

      {/* --- Main Sticky Navigation Bar --- */}
      <nav className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <a href="#about" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded bg-none flex items-center justify-center font-black text-neutral-950 text-sm tracking-tighter group-hover:scale-110 transition">
              <Image 
                src="/RENDER/VIEW/iHAVECPU_COM.png"
                alt="iHAVECPU Logo"
                width={32}
                height={32}
              />
            </div>
            <div>
              <span className="font-extrabold tracking-tight block leading-none text-sm">
                iHAVECPU HAT YAI
              </span>
              <span className="text-[10px] text-red-500 font-mono tracking-widest uppercase">
                FEB 2027 &bull; Songkhla, Thailand
              </span>
            </div>
          </a>

          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-400">
            <a href="#concept" className="hover:text-white transition">Concept</a>
            <a href="#gallery" className="hover:text-white transition">Gallery</a>
            <a href="#location" className="hover:text-white transition">Location</a>
            <a href="#sponsors" className="hover:text-white transition">Ads Space</a>
          </div>

          <div className="flex items-center gap-3">
            <a href="#sponsors" className="bg-red-500 hover:bg-red-400 text-neutral-950 font-bold px-4 py-1.5 rounded-md text-xs transition">
              Book Now &rarr;
            </a>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION (#about) --- */}
      <section 
        id="about" 
        className="relative min-h-screen flex items-center justify-center border-b border-neutral-800 overflow-hidden bg-neutral-950"
      >
        {/* Next.js Optimized Hero Background Image faking bg-fixed */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/RENDER/VIEW/hero-bg.png" 
            alt="iHAVECPU Hat Yai Background" 
            fill
            priority
            className="object-cover object-center fixed"
          />
        </div>

        {/* Dark overlay to make sure text is readable on top of the image */}
        <div className="absolute inset-0 bg-neutral-950/70 z-0"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="inline-block bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-mono px-3 py-1 rounded-full mb-6">
            NEW STORE — GRAND OPENING FEB 2027
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none mb-6 text-white">
            iHAVECPU <br />
            <span className="text-red-500">HAT YAI</span>
          </h1>
          <p className="text-neutral-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-4">
            Where Custom PC Craftsmanship Meets Modern Retail Experience.
          </p>
          <p className="text-neutral-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed mb-8">
            The central hub for D.I.Y. PC enthusiasts, gamers, and creators.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="#sponsors" className="bg-red-500 hover:bg-red-400 text-neutral-950 font-bold px-6 py-3 rounded-lg text-sm transition shadow-lg">
              Explore Sponsorship Slots &rarr;
            </a>
            <a href="#concept" className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white font-medium px-6 py-3 rounded-lg text-sm transition">
              Store Concept
            </a>
          </div>
        </div>
      </section>

      {/* --- STORE CONCEPT & PILLARS (#concept) --- */}
      <section id="concept" className="border-b border-neutral-800 py-20 bg-neutral-950">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <span className="text-red-500 font-mono text-xs tracking-widest uppercase">01 // Store Concept</span>
            <h2 className="text-2xl uppercase sm:text-3xl font-extrabold mt-1">The Open-Tech Showroom</h2>
            <p className="text-neutral-400 text-sm mt-3 leading-relaxed">
              Designed by design station, the iHAVECPU Hat Yai concept reimagines the traditional computer shop as a bright, transparent, and modern tech gallery.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-neutral-900/60 border border-neutral-800 p-6 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 font-bold mb-4">ECO</div>
              <h3 className="font-bold text-base mb-2">Complete Hardware Ecosystem</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">Customers can configure an entire setup under one roof.</p>
            </div>
            <div className="bg-neutral-900/60 border border-neutral-800 p-6 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 font-bold mb-4">TOP</div>
              <h3 className="font-bold text-base mb-2">Top-Tier Brand & Brand Integration</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">Built-in visual merchandising spaces support major gaming and hardware partners.</p>
            </div>
            <div className="bg-neutral-900/60 border border-neutral-800 p-6 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 font-bold mb-4">CBT</div>
              <h3 className="font-bold text-base mb-2">Live Custom-Build Theater</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">With three workstations directly inside the main customer space. Customers can watch their custom rigs being built in real timeใ</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- STORE TOUR & GALLERY (#gallery) --- */}
      <section id="gallery" className="border-b border-neutral-800 py-20 bg-neutral-900/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-red-500 font-mono text-xs tracking-widest uppercase">02 // Store Perspectives</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">THE GALLERY</h2>
            </div>
            <p className="text-xs text-neutral-400 font-mono">3D Architectural Renders &bull; Shop Layout</p>
          </div>
          
          {/* --- Large Main Gallery Slider (Text Removed) --- */}
          <div className="relative w-full aspect-video bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden mb-6 group shadow-lg">
            <Image 
              src={activeGalleryItem.image} 
              alt={activeGalleryItem.title} 
              fill
              className="object-cover transition duration-500 ease-out" 
            />

            {/* Slider Controls */}
            <button 
              onClick={handlePrevGallery}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-500 hover:text-black z-10"
            >
              &#8592;
            </button>
            <button 
              onClick={handleNextGallery}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-500 hover:text-black z-10"
            >
              &#8594;
            </button>
          </div>

          {/* --- Thumbnail Selection Grid --- */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
            {GALLERY_ITEMS.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setGallerySlide(idx)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition ${
                  idx === gallerySlide ? 'border-red-500 opacity-100' : 'border-transparent opacity-50 hover:opacity-100'
                }`}
              >
                <Image 
                  src={item.image} 
                  alt={item.title} 
                  fill
                  sizes="(max-width: 768px) 33vw, 15vw"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* --- STORE LOCATION (#location) --- */}
      <section id="location" className="border-b border-neutral-800 py-20 bg-neutral-950">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-red-500 font-mono text-xs tracking-widest uppercase">03 // Visit Us</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-1 mb-4">iHAVECPU HAT YAI</h2>
            <p className="text-neutral-400 text-sm leading-relaxed mb-6">Located in Hat Yai, our standalone store offers customer parking area, and a comfortable environment for extended consultations.</p>
            <div className="space-y-3 font-mono text-xs text-neutral-300 border-l-2 border-red-500 pl-4 mb-8">
              <p>Hatyai Village</p>
              <p>Kho Hong, Hat Yai District, Songkhla</p>
              <p>Opening Hours: Daily | 11:00 AM — 8:00 PM</p>
            </div>
            <a href="https://maps.app.goo.gl/KSUWCsxQt72cQQP86" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 px-5 py-2.5 rounded-lg text-xs font-semibold transition">
              Open in Google Maps &rarr;
            </a>
          </div>
          {/* --- Interactive Google Maps Embed --- */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-2 h-full min-h-[350px] shadow-lg overflow-hidden flex">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3923.7355606227507!2d100.499122!3d7.029523999999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zN8KwMDEnNDYuMyJOIDEwMMKwMjknNTYuOCJF!5e1!3m2!1sen!2sth!4v1795143952164!5m2!1sen!2sth"
              width="100%" 
              height="100%" 
              style={{ border: 0, borderRadius: '0.75rem' }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Store Location Map"
              className="flex-grow"
            ></iframe>
          </div>
        </div>
      </section>

      {/* --- SPONSORSHIP & BOOKING PORTAL (#sponsors) --- */}
      <section id="sponsors" className="py-20 bg-neutral-900/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-red-500 font-mono text-xs tracking-widest uppercase">04 // Strategic Partnerships</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">INTERACTIVE AD-SPACE BOOKING</h2>
              <p className="text-neutral-400 text-sm mt-2 max-w-xl">
                Select a zone, then click on available positions to add them to your booking summary. 
                iHAVECPU Hat Yai offers a high-energy retail platform built for high foot traffic, community engagement, and sustained sales growth. Connect with our team to explore retail space collaborations, co-branded launch activations.
              </p>
            </div>
          </div>

          {/* --- Zone Tabs --- */}
          <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-neutral-800 pb-4">
            <button onClick={() => handleTabChange('exteriorLogo')} className={`px-5 py-2 rounded-t-lg text-sm font-bold transition ${filter === 'exteriorLogo' ? 'bg-red-500 text-neutral-950 border-b-4 border-red-600' : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'}`}>
              Exterior Logo
            </button>
            <button onClick={() => handleTabChange('interiorLightBox')} className={`px-5 py-2 rounded-t-lg text-sm font-bold transition ${filter === 'interiorLightBox' ? 'bg-red-500 text-neutral-950 border-b-4 border-red-600' : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'}`}>
              Interior Lightbox
            </button>
            <button onClick={() => handleTabChange('tableLightBox')} className={`px-5 py-2 rounded-t-lg text-sm font-bold transition ${filter === 'tableLightBox' ? 'bg-red-500 text-neutral-950 border-b-4 border-red-600' : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'}`}>
              Table Lightbox
            </button>
            <button onClick={() => handleTabChange('interiorLogo')} className={`px-5 py-2 rounded-t-lg text-sm font-bold transition ${filter === 'interiorLogo' ? 'bg-red-500 text-neutral-950 border-b-4 border-red-600' : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'}`}>
              Interior Logo
            </button>
          </div>

          {/* --- Zone Layout Image Slider Placeholder --- */}
          {currentZoneImages.length > 0 && (
            <div className="relative w-full aspect-video md:aspect-[21/9] bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden mb-10 group shadow-lg">
              
              <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 text-neutral-600 font-mono text-xs">
                [ Layout Image Placeholder: {filter} - {activeSlide + 1} / {currentZoneImages.length} ]
              </div>
              
              <Image 
                src={currentZoneImages[activeSlide]} 
                alt={`${filter} layout preview`} 
                fill
                className="object-cover opacity-80 transition duration-300"
              />

              <button 
                onClick={handlePrevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-500 hover:text-black z-10"
              >
                &#8592;
              </button>

              <button 
                onClick={handleNextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-500 hover:text-black z-10"
              >
                &#8594;
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                {currentZoneImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition ${idx === activeSlide ? 'bg-red-500 w-6' : 'bg-white/50 hover:bg-white'}`}
                  />
                ))}
              </div>
            </div>
          )}

{/* Ad Slots Display Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {slots
              .filter((slot) => slot.zone === filter)
              .map((slot) => {
              const isSelected = selectedSlots.some((s) => s.id === slot.id);
              const isAvailable = slot.status.toUpperCase() === 'AVAILABLE';

              return (
                <div
                  key={slot.id}
                  onClick={() => {
                    if (isAvailable) {
                      toggleSlotSelection(slot);
                    }
                  }}
                  className={`bg-neutral-900 border rounded-xl p-5 flex flex-col justify-between transition ${
                    isSelected ? 'border-red-500 ring-2 ring-red-500/30 bg-neutral-900/90' : 'border-neutral-800 hover:border-neutral-700'
                  } ${isAvailable ? 'cursor-pointer' : ''}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded">
                        {slot.code}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          isAvailable ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}>
                        {slot.status.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-base font-bold mb-1">{slot.title}</h3>
                    <p className="text-xs text-neutral-400 uppercase tracking-wider mb-3">
                      {slot.dimensions}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-neutral-800/80 pt-3 mt-auto">
                    <span className="text-base font-bold text-white">
                      {slot.priceTHB.toLocaleString()} <span className="text-xs font-normal">THB</span>
                    </span>
                    <button
                      type="button"
                      disabled={!isAvailable}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSlotSelection(slot);
                      }}
                      className={`px-3 py-1.5 rounded-lg font-medium text-xs transition ${
                        isSelected ? 'bg-red-500 text-neutral-950 font-bold' : isAvailable ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200' : 'bg-neutral-950 text-neutral-600 cursor-not-allowed border border-neutral-800'
                      }`}
                    >
                      {isSelected ? '✓ Selected' : isAvailable ? '+ Add' : 'Booked'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-neutral-800 bg-neutral-950 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-neutral-500">
          <div>
            <span className="font-bold text-neutral-300 block mb-1">iHAVECPU CHIANG MAI</span>
            <p>© 2026 iHAVECPU CHIANG MAI. All Rights Reserved.</p>
          </div>
          <div className="flex items-center gap-6 font-mono">
            <a href="mailto:mkt@ihavecpu.com" className="hover:text-red-500 transition">Contact: mkt@ihavecpu.com</a>
          </div>
        </div>
      </footer>

      {/* --- Floating Bottom Selection Bar --- */}
      {selectedSlots.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-neutral-900/95 border-t border-neutral-800 backdrop-blur-md p-4 z-40 shadow-2xl">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="bg-red-500 text-neutral-950 font-bold px-3 py-1 rounded-full text-xs">
                {selectedSlots.length} {selectedSlots.length === 1 ? 'Spot' : 'Spots'} Selected
              </span>
              <div className="text-sm">
                <span className="text-neutral-400">Total: </span>
                <span className="font-bold text-white text-base">{total.toLocaleString()} THB</span>
                {discount > 0 && (
                  <span className="ml-2 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    Bundle Discount: -{discount.toLocaleString()} THB
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button type="button" onClick={() => setSelectedSlots([])} className="px-4 py-2 text-xs text-neutral-400 hover:text-white">
                Clear Selection
              </button>
              <button type="button" onClick={handleOpenModal} className="bg-red-500 hover:bg-red-400 text-neutral-950 font-bold px-6 py-2.5 rounded-lg text-sm transition w-full sm:w-auto">
                Proceed to Booking ({selectedSlots.length}) →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Bundle Confirmation Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-lg w-full p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button onClick={handleCloseModal} className="absolute top-4 right-4 text-neutral-400 hover:text-white">✕</button>
            <h3 className="text-lg font-bold mb-1 text-white">Confirm Bundle Booking</h3>
            <p className="text-xs text-neutral-400 mb-4">Please review your selected placements and provide your brand contact details.</p>
            
            <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 mb-4 space-y-2">
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Selected Placements ({selectedSlots.length})</div>
              {selectedSlots.map((slot) => (
                <div key={slot.id} className="flex items-center justify-between text-sm py-1 border-b border-neutral-900 last:border-0">
                  <div>
                    <span className="font-mono text-xs text-red-500 mr-2">[{slot.code}]</span>
                    <span className="text-neutral-200">{slot.title}</span>
                  </div>
                  <span className="text-neutral-400 font-mono text-xs">{slot.priceTHB.toLocaleString()} THB</span>
                </div>
              ))}
              <div className="pt-2 border-t border-neutral-800 text-xs space-y-1">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal:</span>
                  <span>{subtotal.toLocaleString()} THB</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Bundle Discount:</span>
                    <span>-{discount.toLocaleString()} THB</span>
                  </div>
                )}
                <div className="flex justify-between text-white font-bold text-sm pt-1">
                  <span>Final Total:</span>
                  <span className="text-red-500">{total.toLocaleString()} THB</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Brand / Company Name *</label>
                <input type="text" required placeholder="e.g., ASUS ROG / NVIDIA / MSI" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Primary Contact Email *</label>
                <input type="email" required placeholder="marketing@yourbrand.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">CC Email Addresses (Optional)</label>
                <input type="text" placeholder="manager@yourbrand.com, pr@yourbrand.com" value={formData.ccEmails} onChange={(e) => setFormData({ ...formData, ccEmails: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500" />
              </div>
              {statusMsg && (
                <div className={`p-3 rounded-lg text-xs font-medium ${statusMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}>
                  {statusMsg.text}
                </div>
              )}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm text-neutral-400 hover:text-white">Cancel</button>
                <button type="submit" disabled={loading} className="bg-red-500 hover:bg-red-400 text-neutral-950 font-semibold px-6 py-2 rounded-lg text-sm transition disabled:opacity-50">
                  {loading ? 'Submitting...' : `Confirm (${total.toLocaleString()} THB)`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}