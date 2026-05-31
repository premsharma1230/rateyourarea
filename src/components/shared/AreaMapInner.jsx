"use client";

import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";
import { useTheme } from "next-themes";
import "leaflet/dist/leaflet.css";

import { buildMapSearchQuery } from "@/lib/osm-geocoding";
import styles from "./AreaMap.module.scss";

const TILES = {
  light:
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
};

function createMarkerIcon() {
  return L.divIcon({
    className: styles.markerWrap,
    html: '<span class="area-map-pin"></span>',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });
}

export default function AreaMapInner({ area }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState(
    area?.lat && area?.lng ? { lat: area.lat, lng: area.lng } : null
  );
  const [loading, setLoading] = useState(!area?.lat || !area?.lng);

  const searchQuery = buildMapSearchQuery(area);
  const isDark = mounted ? resolvedTheme === "dark" : true;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (area?.lat && area?.lng) {
      setCoords({ lat: area.lat, lng: area.lng });
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function geocode() {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/geocode/details?q=${encodeURIComponent(searchQuery)}`
        );
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled && data.lat && data.lng) {
          setCoords({ lat: data.lat, lng: data.lng });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    geocode();
    return () => {
      cancelled = true;
    };
  }, [area?.lat, area?.lng, searchQuery]);

  if (loading) {
    return <div className={styles.placeholder} aria-busy="true" />;
  }

  if (!coords) {
    return (
      <div className={styles.fallback}>
        <p className={styles.fallbackTitle}>{area?.name}</p>
        <p className={styles.fallbackHint}>Gurugram, Haryana</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={[coords.lat, coords.lng]}
      zoom={15}
      scrollWheelZoom={false}
      zoomControl={false}
      className={styles.map}
      attributionControl={false}
    >
      <TileLayer url={isDark ? TILES.dark : TILES.light} />
      <Marker position={[coords.lat, coords.lng]} icon={createMarkerIcon()} />
    </MapContainer>
  );
}
