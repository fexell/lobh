import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export default function FreeMap() {
  const mapRef = useRef(null);

  useEffect(() => {
    // Dynamically import Leaflet on client
    import("leaflet").then((leaflet) => {
      const L = leaflet.default;

      // Set marker icon URLs to public folder
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "/images/leaflet/marker-icon-2x.png",
        iconUrl: "/images/leaflet/marker-icon.png",
        shadowUrl: "/images/leaflet/marker-shadow.png",
      });

      // Initialize map
      if (!mapRef.current._leaflet_id) {
        const map = L.map(mapRef.current).setView(
          [58.994368893070636, 16.20420080517342],
          18
        );

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        L.marker([58.994368893070636, 16.20420080517342])
          .addTo(map)
          .bindPopup("Här är vi lokaliserade!")
          .openPopup();
      }
    });
  }, []);

  return <div ref={mapRef} style={{ width: "100%", height: "300px", zIndex: 0 }} />;
}
