"use client";

import { useEffect, useRef, useState } from "react";
import L, { LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Map as MapIcon,
  Warehouse as WarehouseIcon,
  Info,
  CircleDot
} from "lucide-react";

// Ensure Leaflet icons work correctly with Next.js/Webpack
if (typeof window !== "undefined") {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

// Custom CSS for pulsing animation
const pulsingStyles = `
  @keyframes pulse-blue {
    0% { transform: scale(0.8); opacity: 0.8; box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
    70% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
    100% { transform: scale(0.8); opacity: 0.8; box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
  }
  .pulsing-marker {
    background: #3b82f6;
    border: 2px solid white;
    border-radius: 50%;
    animation: pulse-blue 1s infinite;
  }
`;

interface Warehouse {
  id: string;
  name: string;
  shortCode: string;
  latitude: number | null;
  longitude: number | null;
  status?: string;
  capacityStats?: any;
}

interface TransferLine {
  from: [number, number];
  to: [number, number];
  type: "INTERNAL_TRANSFER" | "VENDOR_ORDER";
  quantity: number;
  productName?: string;
}

interface InventoryMapProps {
  warehouses: Warehouse[];
  transfers?: TransferLine[];
  activeWarehouseId?: string;
  className?: string;
}

export function InventoryMap({
  warehouses,
  transfers = [],
  activeWarehouseId,
  className,
}: InventoryMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const animationFrames = useRef<number[]>([]);
  const animatedMarkers = useRef<L.Marker[]>([]);

  // Function to move marker along polyline with pulsing effect
  const animateTransfer = (polyline: L.Polyline, color: string) => {
    const latlngs = polyline.getLatLngs() as LatLng[];
    if (latlngs.length < 2) return;

    const map = mapInstance.current;
    if (!map) return;

    const pulsingIcon = L.divIcon({
      className: "pulsing-marker",
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    });

    const marker = L.marker(latlngs[0], { icon: pulsingIcon }).addTo(map);
    animatedMarkers.current.push(marker);

    const duration = 3000; // 3 seconds per cycle
    const startTime = Date.now();

    const frame = () => {
      if (!map) return;

      const elapsed = Date.now() - startTime;
      const progress = (elapsed % duration) / duration;

      // Calculate total path distance and find point at progress
      // Simplified: if only 2 points, just interpolate
      if (latlngs.length === 2) {
        const from = latlngs[0];
        const to = latlngs[1];
        const lat = from.lat + (to.lat - from.lat) * progress;
        const lng = from.lng + (to.lng - from.lng) * progress;
        marker.setLatLng([lat, lng]);
      } else {
        // Handle complex polylines if needed
        const totalPoints = latlngs.length;
        const segmentIndex = Math.floor(progress * (totalPoints - 1));
        const segmentProgress = (progress * (totalPoints - 1)) % 1;

        const from = latlngs[segmentIndex];
        const to = latlngs[segmentIndex + 1];

        const lat = from.lat + (to.lat - from.lat) * segmentProgress;
        const lng = from.lng + (to.lng - from.lng) * segmentProgress;
        marker.setLatLng([lat, lng]);
      }

      animationFrames.current.push(requestAnimationFrame(frame));
    };

    const requestId = requestAnimationFrame(frame);
    animationFrames.current.push(requestId);
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Inject styles
    if (typeof document !== "undefined") {
      const styleId = "leaflet-pulsing-styles";
      if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.innerHTML = pulsingStyles;
        document.head.appendChild(style);
      }
    }

    // Initialize Map
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapContainerRef.current, {
        scrollWheelZoom: false,
        zoomControl: true,
      }).setView([18.5204, 73.8567], 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapInstance.current);
    }

    const map = mapInstance.current;

    // Cleanup animations and clear map layers except tilelayer
    animationFrames.current.forEach(cancelAnimationFrame);
    animationFrames.current = [];
    animatedMarkers.current.forEach(m => map.removeLayer(m));
    animatedMarkers.current = [];

    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    // Add Warehouse Markers
    const markerGroup = L.featureGroup();

    warehouses.forEach((w) => {
      if (w.latitude === null || w.longitude === null) return;

      const isActive = w.status === "ACTIVE";
      const isSelected = w.id === activeWarehouseId;

      const pinColor = isSelected ? "#3b82f6" : (isActive ? "#6366f1" : "#94a3b8");

      const marker = L.circleMarker([w.latitude, w.longitude], {
        radius: isSelected ? 10 : 8,
        fillColor: pinColor,
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9,
      }).addTo(map);

      marker.bindPopup(`
        <div class="p-1">
          <h4 class="font-bold text-sm">${w.name}</h4>
          <p class="text-[10px] text-slate-500">${w.shortCode}</p>
          <div class="mt-1 flex items-center gap-1">
             <span class="w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}"></span>
             <span class="text-[9px] uppercase font-bold text-slate-600">${w.status || 'UNKNOWN'}</span>
          </div>
          ${w.capacityStats?.hasFridge ? '<p class="text-[9px] text-blue-500 mt-1">🧊 Cold Storage Verified</p>' : ''}
        </div>
      `);

      markerGroup.addLayer(marker);
    });

    // Add Transfer Lines
    transfers.forEach((t) => {
      const isInternal = t.type === "INTERNAL_TRANSFER";
      const color = isInternal ? "#8b5cf6" : "#f97316"; // Purple vs Orange

      const polyline = L.polyline([t.from, t.to], {
        color: color,
        weight: 3,
        opacity: 0.6,
        dashArray: isInternal ? undefined : "5, 10",
        lineCap: "round",
        lineJoin: "round"
      }).addTo(map);

      polyline.bindPopup(`
        <div class="p-1">
          <p class="font-bold text-[10px] uppercase text-slate-400">${isInternal ? 'Internal Transfer' : 'Vendor Order'}</p>
          <p class="text-sm font-bold text-slate-800">${t.productName || 'Inventory'}</p>
          <p class="text-xs text-slate-600">Quantity: ${t.quantity}</p>
        </div>
      `);

      // Start animation along the line
      animateTransfer(polyline, color);
    });

    // Auto-zoom to fit all warehouses
    if (warehouses.length > 0) {
      const validPoints = warehouses
        .filter(w => w.latitude !== null && w.longitude !== null)
        .map(w => [w.latitude as number, w.longitude as number] as [number, number]);

      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(validPoints);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    }

    return () => {
      animationFrames.current.forEach(cancelAnimationFrame);
      animationFrames.current = [];
    };
  }, [warehouses, transfers, activeWarehouseId]);

  return (
    <Card className={cn("overflow-hidden border-border/50 shadow-lg relative", className)}>
      {/* Map Header Overlay */}
      <div className="absolute top-4 left-4 z-[1000] pointer-events-none">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-border/50 shadow-xl pointer-events-auto">
          <div className="flex items-center gap-2 mb-1">
            <MapIcon className="w-4 h-4 text-indigo-500" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-200">Network Map</h3>
          </div>
          <p className="text-[10px] text-muted-foreground">Live Supply Chain Topology</p>
        </div>
      </div>

      <div ref={mapContainerRef} className="h-[400px] w-full bg-slate-100 dark:bg-slate-950" />

      {/* Legend */}
      <div className="p-4 bg-muted/30 border-t border-border/50">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Internal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-[#f97316] border-2 border-dashed border-white rounded-full" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Vendor</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Inactive</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
