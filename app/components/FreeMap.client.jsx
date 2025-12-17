import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

export default function FreeMap() {
  const mapRef = useRef(null);
  const [L, setL] = useState(null);

  useEffect(() => {
    // Dynamically import Leaflet (client-only)
    import("leaflet").then((leaflet) => {
      const L = leaflet.default;

      // Fix default marker images for Vite/Netlify
      import("leaflet/dist/images/marker-icon-2x.png").then((markerIcon2x) => {
        import("leaflet/dist/images/marker-icon.png").then((markerIcon) => {
          import("leaflet/dist/images/marker-shadow.png").then((markerShadow) => {
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
              iconRetinaUrl: markerIcon2x.default,
              iconUrl: markerIcon.default,
              shadowUrl: markerShadow.default,
            });
          });
        });
      });

      setL(L);
    });
  }, []);

  useEffect(() => {
    if (!L || !mapRef.current) return;

    // Prevent re-initialization
    if (mapRef.current._leaflet_id) return;

    // Initialize map
    const map = L.map(mapRef.current).setView(
      [58.994187774931035, 16.204082585025173],
      18
    );

    // Add OSM tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Add marker
    L.marker([58.994187774931035, 16.204082585025173])
      .addTo(map)
      .bindPopup("Här är vi lokaliserade!")
      .openPopup();
  }, [L]);

  return <div ref={mapRef} style={{ width: "100%", height: "300px", zIndex: 0 }} />;
}
