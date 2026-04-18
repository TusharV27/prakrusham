"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { X, MapPin, Search, Navigation, Check, ChevronRight, Loader2, LocateFixed, Home, Briefcase, Info, Store, Phone, ShieldCheck, ArrowRight } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { getTranslated } from "@/utils/translation";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("./MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-100">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-10 w-10 animate-spin text-[#0c831f]" />
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Loading Map...</p>
      </div>
    </div>
  ),
});

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

export default function LocationPopup() {
  const {
    isLocationOpen,
    closeLocation,
    selectArea,
    saveAddress,
    selectedArea,
    updateCoordinates,
    locationInfo,
    locationAnchorRect,
    user
  } = useAuth();
  const { language, openLanguage, t } = useLanguage();
  const [areas, setAreas] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState("");
  const [detectionError, setDetectionError] = useState(null);
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [areasLoaded, setAreasLoaded] = useState(false);

  // Blinkit Initial View: 'welcome' box as per user screenshot
  const [view, setView] = useState("welcome");
  const [mapCenter, setMapCenter] = useState([21.1702, 72.8311]); // Default Surat center, dynamic after load
  const [detectedAddress, setDetectedAddress] = useState("");
  const [detectedHeadline, setDetectedHeadline] = useState("");
  const [detectedPincode, setDetectedPincode] = useState("");
  const [matchedArea, setMatchedArea] = useState(null);

  const [houseNumber, setHouseNumber] = useState("");
  const [landmark, setLandmark] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [addressLabel, setAddressLabel] = useState("Home");

  useEffect(() => {
    if (user?.phone && !phoneNumber) setPhoneNumber(user.phone);
  }, [user]);

  const fetchAreas = useCallback(async () => {
    if (areas.length > 0 || areasLoaded) return;
    try {
      setLoading(true);
      const res = await fetch("/api/admin/areas");
      const data = await res.json();
      if (data.success) setAreas(data.data);
    } catch (error) {
      console.error("Failed to fetch areas:", error);
    } finally {
      setLoading(false);
      setAreasLoaded(true);
    }
  }, [areas.length, areasLoaded]);

  useEffect(() => {
    if (isLocationOpen) fetchAreas();
  }, [isLocationOpen, fetchAreas]);

  // Small helper to use global getTranslated with local language
  const gt = (field) => getTranslated(field, language);


  const handleLocationDetection = useCallback(async (lat, lon, autoSelect = false, fallbackInfo = null) => {
    setIsDetecting(true);
    setDetectionStatus("Detecting your location...");
    setDetectionError(null);
    setAvailabilityMessage("");
    if (updateCoordinates) updateCoordinates([lat, lon]);

    try {
      await fetchAreas();

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      let detectedData = null;
      if (apiKey && apiKey !== "YOUR_GOOGLE_MAPS_API_KEY_HERE") {
        try {
          const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`);
          const data = await res.json();
          if (data.status === "OK" && data.results.length > 0) {
            const firstResult = data.results[0];
            const getComp = (type) => firstResult.address_components.find(c => c.types.includes(type))?.long_name || "";
            detectedData = {
              display_name: firstResult.formatted_address,
              locality: getComp("locality") || getComp("administrative_area_level_2"),
              address: { postcode: getComp("postal_code"), city: getComp("locality") }
            };
          }
        } catch (e) { console.warn(e); }
      }

      if (!detectedData) {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`, { headers: { 'User-Agent': 'Prakrushi/1.0' } });
          if (res.ok) detectedData = await res.json();
        } catch (e) { console.warn(e); }
      }

      if (detectedData && detectedData.display_name) {
        setDetectionStatus("Location found");
        const detectedPincodeFromGeo = detectedData.address?.postcode?.replace(/\s/g, "").slice(0, 6) || "";
        const finalPincode = detectedPincodeFromGeo || fallbackInfo?.postal || "";
        const finalCity = detectedData.address?.city || detectedData.address?.town || detectedData.locality || fallbackInfo?.city || "";

        setDetectedAddress(detectedData.display_name);
        setDetectedPincode(finalPincode);

        let headline = detectedData.address?.neighbourhood || detectedData.address?.suburb || detectedData.locality || detectedData.display_name.split(',')[0];
        setDetectedHeadline(headline);

        if (finalPincode) {
          let match = areas.find(a => a.pincode.replace(/\s/g, "") === finalPincode);

          // Smart Fallback: If Nominatim gives a garbage pincode, fall back to IP-based postal data.
          if (!match && fallbackInfo && fallbackInfo.postal) {
            const fallbackMatch = areas.find(a => a.pincode.replace(/\s/g, "") === fallbackInfo.postal);
            if (fallbackMatch) {
              match = fallbackMatch;
              setDetectedPincode(fallbackInfo.postal);
            }
          }

          if (!match && finalCity) {
            match = areas.find(a => {
              const names = [a.city?.en?.toLowerCase(), a.city?.hi?.toLowerCase(), (typeof a.city === 'string' ? a.city.toLowerCase() : "")];
              return names.includes(finalCity.toLowerCase());
            });
          }

          setMatchedArea(match || null);

          if (match) {
            setDetectionStatus("Checking availability...");
            setAvailabilityMessage(`Service available in ${getTranslated(match.areaName)} (${match.pincode}).`);

            if (autoSelect) {
              setTimeout(() => {
                selectArea(match);
                openLanguage();
              }, 600);
            }
          } else {
            setDetectionError(`We don't serve area ${finalPincode} yet.`);
            setAvailabilityMessage("Please choose another area or enter a different location.");
          }
        } else {
          setMatchedArea(null);
          setDetectionError("Pincode not found.");
        }
      } else {
        throw new Error("No address found");
      }
    } catch (error) {
      setDetectionError("Could not resolve address.");
    } finally {
      setIsDetecting(false);
      setDetectionStatus("");
    }
  }, [areas, updateCoordinates, selectArea, openLanguage, fetchAreas]);

  // Sync with locationInfo for background detection
  useEffect(() => {
    if (isLocationOpen && !selectedArea && locationInfo?.latitude && locationInfo?.longitude && !detectedAddress && !isDetecting) {
      setMapCenter([locationInfo.latitude, locationInfo.longitude]);
      handleLocationDetection(locationInfo.latitude, locationInfo.longitude, true, locationInfo);
    }
  }, [isLocationOpen, locationInfo, detectedAddress, isDetecting, selectedArea, handleLocationDetection]);

  const handleAutoDetect = (isManual = true) => {
    setDetectionError(null);
    setIsDetecting(true);

    if (isManual) setView("map");

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setMapCenter([pos.coords.latitude, pos.coords.longitude]);
          handleLocationDetection(pos.coords.latitude, pos.coords.longitude, !isManual, locationInfo);
        },
        async (error) => {
          if (error.code === 1) {
            setDetectionError("We do not have permission to determine your location. Please enter manually.");
          }

          try {
            const res = await fetch("/api/location");
            const json = await res.json();
            if (json.success && json.data) {
              const data = json.data;
              const ip = data.ip || "";
              // We now rely dynamically on what the API returns (data.latitude / data.longitude)
              // even for local/private IPs there is fallback data returned by /api/location
              // bypassing the hardcoded 21.2291 logic entirely.
              setMapCenter([data.latitude, data.longitude]);
              handleLocationDetection(data.latitude, data.longitude, !isManual, data);
            }
          } catch (e) {
            setIsDetecting(false);
          }
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  };

  const handleFinalSave = async () => {
    if (!houseNumber) { alert("Enter House/Flat number."); return; }
    if (!phoneNumber || phoneNumber.length < 10) { alert("Enter a valid phone number."); return; }
    setIsSaving(true);
    try {
      const result = await saveAddress({ houseNumber, landmark, phoneNumber, type: addressLabel, pincode: detectedPincode, detectedHeadline, city: detectedAddress.split(',').reverse()[2]?.trim() || 'Surat' });
      if (!result.success) alert("Save failed: " + result.error);
    } catch (e) { console.error(e); } finally { setIsSaving(false); }
  };

  const dropdownStyles = useMemo(() => {
    if (!locationAnchorRect) return null;
    const width = 340;
    const left = Math.max(15, locationAnchorRect.left + (locationAnchorRect.width / 2) - (width / 2));
    const arrowOffset = (locationAnchorRect.left + locationAnchorRect.width / 2) - left;

    return {
      top: locationAnchorRect.top + locationAnchorRect.height + 15,
      left: left,
      position: 'fixed',
      width: width,
      arrowOffset: arrowOffset
    };
  }, [locationAnchorRect]);

  const filteredAreas = areas.filter(a => {
    const q = searchQuery.toLowerCase();
    return getTranslated(a.areaName).toLowerCase().includes(q) || a.pincode.includes(q);
  });

  const isDropdownMode = locationAnchorRect !== null;

  return (
    <AnimatePresence mode="wait">
      {isLocationOpen && (
        <div
          key="location-popup-wrapper"
          className={`fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-hidden ${isDropdownMode ? 'pointer-events-none' : ''}`}
        >
          {/* Background Overlay - Non-blocking in Dropdown mode */}
          <motion.div
            key="location-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLocation}
            className={`fixed inset-0 bg-black/40 backdrop-blur-sm ${isDropdownMode ? 'pointer-events-auto bg-transparent backdrop-blur-0' : 'pointer-events-auto'}`}
          />

          <motion.div
            key={isDropdownMode ? "location-dropdown" : `location-modal-${view}`}
            initial={isDropdownMode ? { opacity: 0, y: -20, scale: 0.95 } : { y: "100%", opacity: 0 }}
            animate={isDropdownMode ? { opacity: 1, y: 0, scale: 1 } : { y: 0, opacity: 1 }}
            exit={isDropdownMode ? { opacity: 0, y: -20, scale: 0.95 } : { y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 450 }}
            className={`relative w-full sm:h-auto bg-white shadow-[0_30px_100px_rgba(0,0,0,0.15)] overflow-visible sm:rounded-[32px] flex flex-col pointer-events-auto ${view === 'welcome' && !isDropdownMode ? 'max-w-[360px] h-auto rounded-t-[32px] sm:rounded-[40px] sm:max-w-md' : view === 'welcome' && isDropdownMode ? 'rounded-[28px]' : 'h-[100dvh] sm:max-w-4xl'}`}
            style={isDropdownMode ? dropdownStyles : {}}
          >
            {/* Dropdown Arrow - Dynamically Positioned */}
            {isDropdownMode && (
              <div
                className="absolute -top-1.5 w-3 h-3 bg-white rotate-45 rounded-tl-sm shadow-[-5px_-5px_10px_rgba(0,0,0,0.03)] -translate-x-1/2 transition-all duration-300"
                style={{ left: dropdownStyles?.arrowOffset || '50%' }}
              />
            )}

            {view === 'welcome' ? (
              <div className="p-5 pt-8 text-center bg-white relative z-10">
                <h2 className="text-[20px] font-black text-[#1a1a1a] leading-tight">
                  {t("detect_location") || "Detect Location"}
                </h2>

                <div className="flex flex-col items-center gap-4 mt-2">
                  {isDetecting ? (
                    <div className="py-10 flex flex-col items-center gap-4">
                      <div className="relative">
                        <SonarPulse />
                        <div className="h-16 w-16 bg-[#0c831f] rounded-full flex items-center justify-center text-white shadow-xl shadow-[#0c831f]/20">
                          <Navigation className="h-8 w-8 animate-pulse" />
                        </div>
                      </div>
                      <p className="text-[14px] font-bold text-gray-500 animate-pulse mt-4">Finding your precision location...</p>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleAutoDetect(false)}
                        className="w-full h-14 flex items-center justify-center gap-2.5 px-6 bg-[#0c831f] text-white rounded-[14px] font-extrabold text-[15px] shadow-lg shadow-[#0c831f]/10 active:scale-[0.98] transition-all"
                      >
                        <Navigation className="h-5 w-5" /> {t("detect_location") || "Detect my location"}
                      </button>

                      <div className="flex items-center gap-4 w-full px-2">
                        <div className="h-[1px] flex-1 bg-gray-100" />
                        <div className="text-[10px] font-extrabold text-gray-400 tracking-widest px-1">OR</div>
                        <div className="h-[1px] flex-1 bg-gray-100" />
                      </div>

                      <div className="relative w-full">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400/80" />
                        <input
                          type="text"
                          placeholder={t("search_location_placeholder") || "Search area, pincode or landmark..."}
                          onFocus={() => setView('map')}
                          className="w-full h-13 pl-13 pr-6 rounded-[14px] bg-[#f8f8f8] border border-[#f0f0f0] outline-none font-bold text-[14.5px] text-gray-600 placeholder:text-gray-400/80 focus:bg-white focus:border-[#0c831f]/30 transition-all shadow-sm"
                        />
                      </div>
                    </>
                  )}
                </div>

                {detectionError && detectionError.includes("permission") && (
                  <div className="mt-8 p-4 bg-red-50/50 rounded-[20px]">
                    <p className="text-[12px] font-bold text-red-500 text-center">{detectionError}</p>
                  </div>
                )}

                {availabilityMessage && (
                  <div className="mt-6 p-4 rounded-[20px] bg-emerald-50 border border-emerald-100">
                    <p className="text-[13px] font-bold text-emerald-700 text-center">{availabilityMessage}</p>
                  </div>
                )}

                {detectionStatus && !isDetecting && (
                  <div className="mt-6 p-4 rounded-[20px] bg-slate-50 border border-slate-200">
                    <p className="text-[12px] font-bold text-slate-600 text-center">{detectionStatus}</p>
                  </div>
                )}
              </div>
            ) : view === "address_details" ? (
              <div className="flex flex-col h-full bg-white sm:max-h-[85vh]">
                <div className="p-8 pt-14 border-b border-gray-100 flex items-center gap-5">
                  <button onClick={() => setView('map')} className="p-3 hover:bg-gray-100 rounded-2xl transition-all border border-gray-100"><ChevronRight className="h-5 w-5 rotate-180" /></button>
                  <h3 className="text-[24px] font-black tracking-tight text-gray-900">Enter address details</h3>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-10 pb-40 custom-scrollbar">
                  <div className="p-6 rounded-[32px] bg-[#0c831f]/5 border-2 border-[#0c831f]/10 flex gap-5">
                    <div className="h-14 w-14 flex items-center justify-center rounded-[20px] bg-[#0c831f] text-white"><MapPin className="h-7 w-7" strokeWidth={2.5} /></div>
                    <div className="flex-1 min-w-0"><p className="text-[19px] font-black text-gray-900 truncate">{detectedHeadline}</p><p className="text-[13px] font-medium text-gray-500 line-clamp-2">{detectedAddress}</p></div>
                  </div>

                  <div className="grid gap-8">
                    <div className="space-y-3">
                      <label className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">House / Flat / Floor</label>
                      <input type="text" value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)} placeholder="e.g. Unit 402, 4th Floor" className="w-full h-18 px-8 rounded-[24px] border-2 border-gray-100 focus:border-[#0c831f] outline-none font-bold text-[17px] bg-gray-50/50" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Landmark (Optional)</label>
                      <input type="text" value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="e.g. Opposite the Big Temple" className="w-full h-18 px-8 rounded-[24px] border-2 border-gray-100 focus:border-[#0c831f] outline-none font-bold text-[17px] bg-gray-50/50" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Delivery Phone</label>
                      <div className="relative"><Phone className="absolute left-8 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /><input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full h-18 pl-18 pr-8 rounded-[24px] border-2 border-gray-100 focus:border-[#0c831f] outline-none font-bold text-[17px] bg-gray-50/50" /></div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Label As</label>
                      <div className="flex gap-4">
                        {['Home', 'Work', 'Other'].map(l => (
                          <button key={l} onClick={() => setAddressLabel(l)} className={`flex-1 h-16 rounded-[22px] font-black text-[14px] border-2 transition-all flex items-center justify-center gap-3 ${addressLabel === l ? 'bg-gray-900 border-gray-900 text-white' : 'border-gray-100 bg-white text-gray-500'}`}>
                            {l === 'Home' && <Home className="h-5 w-5" />}{l === 'Work' && <Briefcase className="h-5 w-5" />}{l}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 pt-4 border-t border-gray-100 bg-white sm:rounded-b-[40px]">
                  <button onClick={handleFinalSave} disabled={isSaving} className="w-full bg-[#0c831f] text-white py-6 rounded-[28px] font-black text-[18px] shadow-2xl active:scale-[0.98] disabled:bg-gray-100 flex items-center justify-center gap-3">
                    {isSaving ? <><Loader2 className="h-6 w-6 animate-spin" /> Finalizing...</> : "Confirm & Save Address"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col">
                <div className="absolute top-12 sm:top-10 left-4 right-4 z-[1015] transition-all">
                  <div className="relative group max-w-2xl mx-auto">
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-3xl rounded-[28px] shadow-2xl border-2 border-white/50" />
                    <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-6 w-6 text-[#0c831f] z-10" />
                    <input type="text" placeholder="Search for your building / area..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="relative h-16 w-full bg-transparent pl-16 pr-8 text-[16px] font-black outline-none z-10" />

                    <AnimatePresence>
                      {searchQuery && (
                        <motion.div
                          key="search-results-dropdown"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute top-20 inset-x-0 bg-white shadow-3xl rounded-[32px] border-4 border-white max-h-[45vh] overflow-y-auto z-50 p-2 custom-scrollbar"
                        >
                          {filteredAreas.length > 0 ? filteredAreas.map(a => (
                            <button key={a.id} onClick={() => { selectArea(a); openLanguage(); }} className="w-full flex items-center gap-5 p-5 hover:bg-gray-50 rounded-[24px] text-left">
                              <div className="h-12 w-12 flex items-center justify-center rounded-[20px] bg-gray-100 text-gray-400"><MapPin className="h-6 w-6" /></div>
                              <div><p className="text-[15px] font-black text-gray-900">{getTranslated(a.areaName)}</p><p className="text-[12px] font-bold text-gray-400">{a.pincode} • {getTranslated(a.city)}</p></div>
                            </button>
                          )) : <div className="p-10 text-center text-gray-400 font-bold italic">No stores in this area</div>}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex-1 relative order-1 min-h-[400px] bg-slate-50">
                  <MapPicker center={mapCenter} onMove={(lat, lng) => { setMapCenter([lat, lng]); handleLocationDetection(lat, lng, false, locationInfo); }} isDetecting={isDetecting} />
                  <button onClick={() => handleAutoDetect(true)} className="absolute right-6 bottom-48 h-15 w-15 flex items-center justify-center bg-white rounded-[24px] shadow-3xl text-[#0c831f] z-[1010] border-4 border-white"><LocateFixed className="h-7 w-7" /></button>
                </div>

                <div className="absolute bottom-0 inset-x-0 p-8 bg-white/95 backdrop-blur-3xl border-t-2 border-gray-100 z-[1030] sm:rounded-b-[40px] shadow-2xl">
                  <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-8">
                    <div className="flex-1 min-w-0 w-full text-center sm:text-left">
                      <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Selected Location</h4>
                      <p className="text-[22px] font-black text-gray-900 truncate mb-1">{detectedHeadline || (isDetecting ? (t("detect_location") || "Detecting...") : "Locating...")}</p>
                      <p className="text-[14px] font-bold text-gray-500 truncate">{detectedAddress || "Drag map to pick exactly"}</p>
                    </div>

                    <button disabled={!matchedArea || isDetecting} onClick={() => setView("address_details")} className="w-full sm:w-auto px-16 py-6 bg-gray-900 text-white rounded-[30px] font-black text-[18px] shadow-xl disabled:bg-gray-100 flex items-center justify-center gap-4">
                      Confirm Location <ArrowRight className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
