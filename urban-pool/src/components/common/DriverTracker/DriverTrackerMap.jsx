import { useState, useEffect, useRef } from "react";
import { GoogleMap, useLoadScript, Polyline, Marker } from "@react-google-maps/api";
import { io } from "socket.io-client";
import { useAuth } from "../../../context/AuthContext";
import "./DriverTrackerMap.css";

const libraries = ["places"];
const mapContainerStyle = { width: "100%", height: "100%", borderRadius: "12px" };

export default function DriverTrackerMap({ pickup, driverName }) {
  const { user } = useAuth();
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const hasValidKey = apiKey && apiKey !== "YOUR_API_KEY_HERE";

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: hasValidKey ? apiKey : "",
    libraries,
  });

  const [driverPos, setDriverPos] = useState(null);
  const [eta, setEta] = useState("Calculating...");
  const [routePath, setRoutePath] = useState([]);
  const [heading, setHeading] = useState(0);

  useEffect(() => {
    if (!user) return;
    const socket = io("http://localhost:5001");
    const userId = user.userId || user.uid || "mock_user_1";

    socket.on("connect", () => {
      socket.emit("join_room", userId);
    });

    socket.on("driver_route", (path) => {
      setRoutePath(path);
      if (path && path.length > 0) {
        setDriverPos(path[0]);
      }
    });

    socket.on("driver_location_update", (data) => {
      setDriverPos({ lat: data.lat, lng: data.lng });
      setHeading(data.heading);
      if (data.eta) setEta(data.eta);
    });

    socket.on("driver_arrived", (data) => {
      setEta("Arrived");
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  if (!hasValidKey) {
    return (
      <div className="tracker-wrapper">
        <div className="tracker-placeholder">
          <span className="tracker-icon">🚗</span>
          <h4>Live Tracking Disabled</h4>
          <p>Add a valid Google Maps API Key to watch {driverName} approach in real-time.</p>
        </div>
      </div>
    );
  }

  if (loadError) return <div className="tracker-placeholder">Error loading Maps API</div>;
  if (!isLoaded) return <div className="tracker-placeholder">Loading Live Tracker...</div>;

  return (
    <div className="tracker-wrapper">
      <div className="tracker-status-bar">
        <div className="tracker-status-left">
          <div className="driver-avatar">🚘</div>
          <div className="driver-info">
            <strong>{driverName}</strong>
            <span>{eta === "Arrived" ? "Driver is outside!" : `Arriving in ${eta}`}</span>
          </div>
        </div>
        <div className="tracker-car-plate">UP-01-AB-1234</div>
      </div>
      
      <div className="tracker-map-container">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={14}
          center={driverPos || (routePath.length > 0 ? routePath[0] : { lat: 30.7333, lng: 76.7794 })}
          options={{
            disableDefaultUI: true,
            gestureHandling: 'cooperative'
          }}
        >
          {/* Blue route line matching the physical driver path */}
          {routePath.length > 0 && (
            <Polyline
              path={routePath}
              options={{ strokeColor: "#3b82f6", strokeWeight: 5, strokeOpacity: 0.8 }}
            />
          )}

          {/* User Pickup Marker */}
          {routePath.length > 0 && (
            <Marker 
              position={routePath[routePath.length - 1]}
              icon={{
                url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
              }}
            />
          )}

          {/* Moving Driver Marker */}
          {driverPos && (
            <Marker 
              position={driverPos}
              icon={{
                path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 6,
                fillColor: "#000000",
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: "#ffffff",
                rotation: heading
              }}
              zIndex={999}
            />
          )}
        </GoogleMap>
      </div>
    </div>
  );
}
