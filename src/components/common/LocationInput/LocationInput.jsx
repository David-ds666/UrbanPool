import { useState, useEffect, useRef } from "react";
import { Autocomplete, useLoadScript } from "@react-google-maps/api";
import "./LocationInput.css";

const libraries = ["places"];

// Mock data with icons to match the screenshot vibe
const MOCK_PLACES = [
  { main: "Mohali", sub: "Punjab", type: "place" },
  { main: "Mohali walk", sub: "Sector 62, Sahibzada Ajit Singh Nagar, Punjab", type: "history" },
  { main: "Mohali Punjab", sub: "District in Punjab", type: "place" },
  { main: "Mohali Bus Stand", sub: "Mohali Bypass, Phase 6, Sector 56", type: "place" },
  { main: "Mohali Railway Station Road", sub: "Phase 10, Sector 64", type: "place" },
  { main: "Mohali Airport Chowk", sub: "Gmada Aerocity, Chachu Majra", type: "place" },
  { main: "Chandigarh", sub: "Chandigarh", type: "place" },
  { main: "Chandigarh International Airport", sub: "New Civil Air Terminal", type: "place" },
  { main: "New Delhi", sub: "Delhi", type: "history" },
  { main: "Sunrise Hotel", sub: "Phase 7, Mohali, Punjab", type: "place" },
  { main: "Sunrise Apartments", sub: "Sector 70, Mohali, Punjab", type: "place" },
  { main: "Sunrise Valley", sub: "Zirakpur, Punjab", type: "place" },
];

export default function LocationInput({ placeholder, value, onChange, icon }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const hasValidKey = apiKey && apiKey !== "YOUR_API_KEY_HERE";

  // -- Google Maps Flow --
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: hasValidKey ? apiKey : "",
    libraries,
  });

  const [autocomplete, setAutocomplete] = useState(null);

  const onLoad = (autocompleteObj) => {
    setAutocomplete(autocompleteObj);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      onChange(place.formatted_address || place.name || "");
    }
  };

  // -- Fallback Nominatim Flow --
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const searchRef = useRef("");

  useEffect(() => {
    if (hasValidKey) return;
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [hasValidKey]);

  const handleNominatimChange = async (e) => {
    const val = e.target.value;
    searchRef.current = val;
    onChange(val);

    if (val.trim().length > 0) {
      const lowerVal = val.toLowerCase();
      const matchedMocks = MOCK_PLACES.filter(
        (p) => p.main.toLowerCase().includes(lowerVal) || p.sub.toLowerCase().includes(lowerVal)
      );

      if (matchedMocks.length > 0) {
        setSuggestions(matchedMocks);
        setIsOpen(true);
      } else {
        setSuggestions([]);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val + ", India")}&format=json&addressdetails=1&limit=5`);
          const data = await res.json();
          if (searchRef.current === val) {
            const apiSuggestions = data.map(item => {
              const parts = item.display_name.split(", ");
              return { main: parts[0], sub: parts.slice(1).join(", "), type: "place" };
            });
            setSuggestions(apiSuggestions);
            setIsOpen(apiSuggestions.length > 0);
          }
        } catch (err) {
          console.error("Geocoding error:", err);
          if (searchRef.current === val) setSuggestions([]);
        }
      }
    } else {
      setIsOpen(false);
      setSuggestions([]);
    }
  };

  const handleSelectFallback = (place) => {
    onChange(`${place.main}, ${place.sub}`);
    setIsOpen(false);
  };

  // Render Fallback if no valid key
  if (!hasValidKey) {
    return (
      <div className="location-input-wrapper" ref={wrapperRef}>
        {icon && <span className="location-input-icon">{icon}</span>}
        <input
          type="text"
          className={icon ? "has-icon" : ""}
          placeholder={placeholder}
          value={value}
          onChange={handleNominatimChange}
          onFocus={() => { if (suggestions.length > 0) setIsOpen(true) }}
        />
        {isOpen && suggestions.length > 0 && (
          <div className="autocomplete-dropdown">
            {suggestions.map((place, idx) => (
              <div key={idx} className="suggestion-item" onClick={() => handleSelectFallback(place)}>
                <div className="suggestion-icon">
                  {place.type === "history" ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="10" r="3"></circle><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"></path></svg>
                  )}
                </div>
                <div className="suggestion-text">
                  <span className="suggestion-main">{place.main}</span>
                  <span className="suggestion-sub">{place.sub}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Render Google Maps API
  if (loadError) return (
    <div className="location-input-wrapper">
      <input type="text" placeholder="Error Loading Maps API" disabled className="error-input" />
    </div>
  );
  if (!isLoaded) return (
    <div className="location-input-wrapper">
      <input type="text" placeholder="Loading Maps..." disabled className="loading-input" />
    </div>
  );

  return (
    <div className="location-input-wrapper">
      {icon && <span className="location-input-icon">{icon}</span>}
      <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
        <input
          className={icon ? "has-icon" : ""}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </Autocomplete>
    </div>
  );
}

