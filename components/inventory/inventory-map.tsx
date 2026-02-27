"use client";

import { useEffect, useRef } from "react";
import L, { LatLngExpression, LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card } from "@/components/ui/card";

interface Warehouse {
  id: string;
  name: string;
  shortCode: string;
  latitude: number | null;
  longitude: number | null;
  stockLevelsCount?: number;
  capacityStats?: {
    totalVolume?: number;
    usedVolume?: number;
    hasFridge?: boolean;
  };
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
  onWarehouseClick?: (warehouse: Warehouse) => void;
}

export function InventoryMap({
  warehouses,
  transfers = [],
  activeWarehouseId,
  onWarehouseClick,
}: InventoryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const linesRef = useRef<L.Polyline[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([18.5204, 73.8567], 11);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
      } as L.TileLayerOptions).addTo(mapInstance.current);
    }

    const map = mapInstance.current;

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      map.removeLayer(marker);
    });
    markersRef.current.clear();

    // Clear existing lines
    linesRef.current.forEach((line) => {
      map.removeLayer(line);
    });
    linesRef.current = [];

    // Add warehouse markers
    const validWarehouses = warehouses.filter(
      (w) => w.latitude !== null && w.longitude !== null
    );

    if (validWarehouses.length === 0) {
      return;
    }

    validWarehouses.forEach((warehouse) => {
      const lat = warehouse.latitude as number;
      const lon = warehouse.longitude as number;
      const isActive = warehouse.id === activeWarehouseId;

      // Create custom marker
      const htmlIcon = document.createElement("div");
      htmlIcon.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: ${isActive ? "#3b82f6" : "#6b7280"};
          border: 3px solid white;
          color: white;
          font-weight: bold;
          font-size: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
        ">
          ${warehouse.shortCode[0]}
        </div>
      `;

      const marker = L.marker([lat, lon], {
        icon: L.divIcon({
          html: htmlIcon.innerHTML,
          className: "warehouse-marker",
          iconSize: [40, 40],
          iconAnchor: [20, 20],
          popupAnchor: [0, -20],
        }),
      }).addTo(map);

      // Add popup
      const popupContent = `
        <div style="font-size: 12px;">
          <strong>${warehouse.name}</strong><br/>
          Code: ${warehouse.shortCode}<br/>
          ${warehouse.capacityStats?.hasFridge ? "🧊 Has Fridge<br/>" : ""}
          ${warehouse.stockLevelsCount ? `Stock Locations: ${warehouse.stockLevelsCount}` : ""}
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on("click", () => {
        if (onWarehouseClick) {
          onWarehouseClick(warehouse);
        }
      });

      markersRef.current.set(warehouse.id, marker);
    });

    // Add transfer lines
    transfers.forEach((transfer) => {
      const polyline = L.polyline([transfer.from, transfer.to], {
        color: transfer.type === "INTERNAL_TRANSFER" ? "#8b5cf6" : "#f97316",
        weight: 2,
        opacity: 0.7,
        dashArray: transfer.type === "VENDOR_ORDER" ? "5, 5" : undefined,
      }).addTo(map);

      // Animate the line if internal transfer
      if (transfer.type === "INTERNAL_TRANSFER") {
        polyline.bringToFront();
        animatePolyline(polyline);
      }

      const midLat = (transfer.from[0] + transfer.to[0]) / 2;
      const midLon = (transfer.from[1] + transfer.to[1]) / 2;

      L.circleMarker([midLat, midLon], {
        radius: 5,
        fillColor: transfer.type === "INTERNAL_TRANSFER" ? "#8b5cf6" : "#f97316",
        color: "white",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
      })
        .addTo(map)
        .bindPopup(
          `<strong>${transfer.productName || "Transfer"}</strong><br/>Qty: ${transfer.quantity}`
        );

      linesRef.current.push(polyline);
    });

    // Fit bounds to show all markers
    if (validWarehouses.length > 0) {
      const bounds = L.latLngBounds(
        validWarehouses.map((w) => [w.latitude as number, w.longitude as number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [warehouses, transfers, activeWarehouseId, onWarehouseClick]);

  return (
    <Card className="overflow-hidden">
      <div ref={mapRef} style={{ height: "500px", width: "100%" }} />
      <div className="p-4 bg-white dark:bg-slate-900 border-t">
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "#8b5cf6" }}
            />
            <span>Internal Transfer</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "#f97316" }}
            />
            <span>Vendor Order</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Active Warehouse</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * Animate a polyline with a pulsing effect using a moving blue circle
 */
function animatePolyline(polyline: L.Polyline) {
  const points = polyline.getLatLngs() as LatLng[];
  if (points.length < 2) return;

  const totalDistance = points.reduce((sum, point, i) => {
    if (i === 0) return 0;
    return (
      sum +
      point.distanceTo(points[i - 1] as LatLng)
    );
  }, 0);

  const animationDuration = 2000; // 2 seconds per animation cycle
  const startTime = Date.now();

  function getPointAtDistance(distance: number): LatLng | null {
    let remaining = distance;
    for (let i = 0; i < points.length - 1; i++) {
      const segmentLength = (points[i + 1] as LatLng).distanceTo(points[i] as LatLng);
      if (remaining <= segmentLength) {
        const ratio = remaining / segmentLength;
        const from = points[i] as LatLng;
        const to = points[i + 1] as LatLng;
        return new L.LatLng(
          from.lat + (to.lat - from.lat) * ratio,
          from.lng + (to.lng - from.lng) * ratio
        );
      }
      remaining -= segmentLength;
    }
    return null;
  }

  const marker = L.circleMarker(points[0] as LatLngExpression, {
    radius: 4,
    fillColor: "#3b82f6",
    color: "white",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.8,
  }).addTo((polyline as unknown as { _map: L.Map })._map);

  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = (elapsed % animationDuration) / animationDuration;
    const distance = totalDistance * progress;

    const point = getPointAtDistance(distance);
    if (point) {
      marker.setLatLng(point);
    }

    if (point) {
      requestAnimationFrame(animate);
    }
  }

  animate();
}
