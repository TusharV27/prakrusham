"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { MapPin, Loader2, Navigation } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const SonarPulse = () => (
  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        initial={{ scale: 0.5, opacity: 0.5 }}
        animate={{ scale: 4, opacity: 0 }}
        transition={{
          duration: 3,
          repeat: Infinity,
          delay: i * 0.8,
          ease: "easeOut"
        }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border-2 border-[#0c831f]/30"
      />
    ))}
  </div>
);

export default function MapPicker({ center, onMove, isDetecting }) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

  const [map, setMap] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const isInternalChange = useRef(false);

  // Sync map center with external center prop (e.g. from detect)
  useEffect(() => {
    if (map && center && !isInternalChange.current) {
      map.panTo({ lat: center[0], lng: center[1] });
      map.setZoom(17);
    }
  }, [center, map]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = useCallback(() => {
    if (!map) return;
    setIsDragging(false);
    const newCenter = map.getCenter();
    isInternalChange.current = true;
    onMove(newCenter.lat(), newCenter.lng());
    
    // Reset internal change flag after a short delay
    setTimeout(() => {
      isInternalChange.current = false;
    }, 500);
  }, [map, onMove]);

  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-50 rounded-3xl">
        <Loader2 className="h-8 w-8 animate-spin text-[#0c831f]" />
      </div>
    );
  }

  const defaultCenter = center ? { lat: center[0], lng: center[1] } : { lat: 21.1702, lng: 72.8311 };

  return (
    <div className="relative h-full w-full overflow-hidden sm:rounded-3xl bg-slate-100">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={17}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        options={{
          disableDefaultUI: true,
          clickableIcons: false,
          gestureHandling: "greedy",
          styles: [
            { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }
          ]
        }}
      />

      <AnimatePresence>
        {isDetecting && <SonarPulse />}
      </AnimatePresence>

      {/* Static Center Marker (Blinkit Ultra style) */}
      <div className="absolute left-1/2 top-1/2 z-[101] -translate-x-1/2 -translate-y-[calc(100%-4px)] pointer-events-none">
        <div className="relative flex flex-col items-center">
          {/* Subtle Dynamic Label */}
          <AnimatePresence>
            {!isDragging && !isDetecting && (
              <motion.div 
                initial={{ opacity: 0, y: -10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                className="bg-gray-900 text-white text-[10px] font-black px-4 py-2 rounded-2xl shadow-2xl mb-4 flex items-center gap-2 border-2 border-white/20 whitespace-nowrap"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-[#0c831f] animate-pulse" />
                HERE IS YOUR LOCATION
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div 
            animate={{ 
              y: isDragging ? -30 : 0,
              scale: isDragging ? 1.2 : 1,
              rotateX: isDragging ? 15 : 0
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="relative"
          >
            <div className="h-14 w-14 flex items-center justify-center rounded-3xl bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-4 border-[#0c831f]">
               <MapPin className="h-7 w-7 text-[#0c831f] fill-[#0c831f]/10" strokeWidth={3} />
            </div>
            {/* Precision Tip */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-[#0c831f] rotate-45 transform origin-center -z-10 rounded-sm shadow-lg border-2 border-white" />
          </motion.div>

          {/* Realistic Shadow */}
          <motion.div 
            animate={{ 
              scale: isDragging ? 0.3 : 1,
              opacity: isDragging ? 0.15 : 0.3,
              y: isDragging ? 5 : 0,
              filter: isDragging ? "blur(4px)" : "blur(2px)"
            }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-2 bg-black rounded-full"
          />
        </div>
      </div>

      {/* Modern Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.05)] z-[100]" />
    </div>
  );
}
