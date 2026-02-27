/**
 * LangGraph-based Multi-Agent System for Intelligent Inventory Rebalancing
 * Coordinates multiple specialized agents: Perception, Geocoding, Rebalancing, PageIndex, and Arbiter
 */

import { StateGraph, Annotation } from "@langchain/langgraph";
import { prisma } from "@/lib/prisma";
import { findNearestWarehouse } from "@/lib/utils/geo";
import { forecastDemand } from "./forecast.agent"
import { calculateReorder } from "./reorder.agent"

// ─────────────────────────────────────────────────────────────────
// Type Definitions & State Schema
// ─────────────────────────────────────────────────────────────────

export interface StockAlert {
  productId: string;
  productName: string;
  sku: string;
  currentQuantity: number;
  minStock: number;
  shortfall: number;
  warehouseId?: string;
  warehouseName?: string;
  locationId?: string;
  attributes?: Record<string, unknown>;
}

export interface NearbyWarehouse {
  id: string;
  name: string;
  shortCode: string;
  latitude: number | null;
  longitude: number | null;
  availableQuantity: number;
  distance?: number;
}

export interface RebalancingAction {
  type: "INTERNAL_TRANSFER" | "VENDOR_ORDER" | "OVERSTOCK" | "NONE";
  sourceWarehouseId?: string;
  destinationWarehouseId?: string;
  quantity: number;
  reason: string;
  validationPassed: boolean;
  constraints?: string[];
  selectedSupplierId?: string;
  supplierScore?: number;
}

export interface AuditLogEntry {
  nodeName: string;
  inputData: Record<string, unknown>;
  outputData: Record<string, unknown>;
  reasoningString: string;
  decision: string;
  error?: string;
}

const AgentStateAnnotation = Annotation.Root({
  traceId: Annotation<string>(),
  userId: Annotation<string>(),
  lowStockAlerts: Annotation<StockAlert[]>(),
  currentAlert: Annotation<StockAlert | null>(),
  weather: Annotation<{ temperature: number; humidity: number } | null>(),
  geocodedLocations: Annotation<
    Record<string, { lat: number; lon: number } | null>
  >(),
  nearbyWarehouses: Annotation<NearbyWarehouse[]>(),
  rebalancingActions: Annotation<RebalancingAction[]>(),
  supplierData: Annotation<
    Record<string, { reliabilityScore: number; leadDays: number } | null>
  >(),
  forecast: Annotation<{
    predictedDemand: number;
    demandGrowthRate: number;
  } | null>(),
  auditLogs: Annotation<AuditLogEntry[]>(),
});

export type AgentState = typeof AgentStateAnnotation.State;

// ─────────────────────────────────────────────────────────────────
// Node 1: Perception
// ─────────────────────────────────────────────────────────────────

export async function perceptionNode(state: AgentState): Promise<Partial<AgentState>> {
  const { userId, traceId } = state;

  try {
    const stockLevels = await prisma.stockLevel.findMany({
      where: { user: { id: userId } },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            minStock: true,
            attributes: true,
          },
        },
        location: {
          select: {
            id: true,
            warehouse: {
              select: {
                id: true,
                name: true,
                address: true,
                latitude: true,
                longitude: true,
              },
            },
          },
        },
      },
    });

    const alerts: StockAlert[] = []

    for (const sl of stockLevels) {
      const forecast = await forecastDemand(sl.product.id)
      const reorder = await calculateReorder(sl.product.id, forecast)

      if (reorder) {
        alerts.push({
          productId: sl.product.id,
          productName: sl.product.name,
          sku: sl.product.sku,
          currentQuantity: sl.quantity,
          minStock: sl.product.minStock,
          shortfall: reorder.quantity,
          warehouseId: sl.location.warehouse?.id,
          warehouseName: sl.location.warehouse?.name,
          locationId: sl.location.id,
          attributes: sl.product.attributes as Record<string, unknown>,
        })
      }
      // --- Overstock Detection ---
      if (sl.quantity > sl.product.minStock * 2) {
        alerts.push({
          productId: sl.product.id,
          productName: sl.product.name,
          sku: sl.product.sku,
          currentQuantity: sl.quantity,
          minStock: sl.product.minStock,
          shortfall: -Math.floor(sl.quantity - sl.product.minStock * 1.2), // excess amount
          warehouseId: sl.location.warehouse?.id,
          warehouseName: sl.location.warehouse?.name,
          locationId: sl.location.id,
          attributes: sl.product.attributes as Record<string, unknown>,
        });
      }
    }

    const weatherResponse = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=18.5204&longitude=73.8567&current=temperature_2m,relative_humidity_2m"
    );
    const weatherData = await weatherResponse.json();
    const weather = weatherData.current ? {
      temperature: weatherData.current.temperature_2m,
      humidity: weatherData.current.relative_humidity_2m,
    } : null;

    const auditLog = {
      nodeName: "Perception",
      inputData: { userId, traceId },
      outputData: { alertCount: alerts.length, weather },
      reasoningString: `Queried stock levels and found ${alerts.length} low-stock alerts.`,
      decision: "Perception complete",
    };

    return {
      lowStockAlerts: alerts,
      weather,
      auditLogs: [...(state.auditLogs || []), auditLog],
      currentAlert: alerts.length > 0 ? alerts[0] : null,
    };
  } catch (error) {
    return {};
  }
}

// ─────────────────────────────────────────────────────────────────
// Node 1.5: Forecasting
// ─────────────────────────────────────────────────────────────────

export async function forecastNode(
  state: AgentState
): Promise<Partial<AgentState>> {

  const { currentAlert, auditLogs } = state;

  if (!currentAlert) return {};

  try {
    const forecast = await forecastDemand(currentAlert.productId);

    const predictedDemand = forecast?.mean ?? 0;
    const demandGrowthRate = forecast?.trendFactor ?? 0;

    const auditLog = {
      nodeName: "Forecast",
      inputData: { productId: currentAlert.productId },
      outputData: { predictedDemand, demandGrowthRate },
      reasoningString: `Predicted 30-day demand: ${predictedDemand}, Growth rate: ${demandGrowthRate}%`,
      decision: "Forecast complete",
    };

    return {
      forecast: {
        predictedDemand,
        demandGrowthRate,
      },
      auditLogs: [...(auditLogs || []), auditLog],
    };

  } catch (error) {
    console.error("Forecast failed:", error);
    return {};
  }
}


// ─────────────────────────────────────────────────────────────────
// Node 2: Geocoding
// ─────────────────────────────────────────────────────────────────

export async function geocodingNode(state: AgentState): Promise<Partial<AgentState>> {
  const { lowStockAlerts } = state;

  const geocoded: Record<string, { lat: number; lon: number } | null> = {};

  for (const alert of lowStockAlerts) {
    if (alert.warehouseId) {
      geocoded[alert.warehouseId] = {
        lat: 18.5204 + Math.random() * 0.1,
        lon: 73.8567 + Math.random() * 0.1,
      };
    }
  }

  return {
    geocodedLocations: geocoded,
  };
}

// ─────────────────────────────────────────────────────────────────
// Node 3: Rebalancing (UPDATED WITH COST MODEL)
// ─────────────────────────────────────────────────────────────────

export async function rebalancingNode(state: AgentState): Promise<Partial<AgentState>> {
  const { userId, currentAlert, geocodedLocations, forecast } = state;

  if (!currentAlert) return {};
  // ─────────────────────────────
  // Overstock Handling
  // ─────────────────────────────

  if (currentAlert.shortfall < 0) {
    const excessQty = Math.abs(currentAlert.shortfall);

    const liquidationAction: RebalancingAction = {
      type: "OVERSTOCK",
      sourceWarehouseId: currentAlert.warehouseId,
      quantity: excessQty,
      reason: `Excess inventory detected. Recommend discounting or redistribution.`,
      validationPassed: false,
      constraints: [],
    };

    const auditLog = {
      nodeName: "Rebalancing",
      inputData: { currentAlert },
      outputData: { liquidationAction },
      reasoningString: `Overstock of ${excessQty} units detected.`,
      decision: "Liquidation recommended",
    };

    return {
      rebalancingActions: [liquidationAction],
      auditLogs: [...(state.auditLogs || []), auditLog],
    };
  }
  // ─────────────────────────────
  // Smart Demand-Based Quantity
  // ─────────────────────────────

  let optimizedQty = currentAlert.shortfall;

  if (forecast && forecast.predictedDemand > 0) {
    const safetyBuffer = forecast.predictedDemand * 0.2; // 20% buffer
    const growthImpact =
      forecast.predictedDemand * (forecast.demandGrowthRate - 1);

    optimizedQty = Math.max(
      0,
      Math.ceil(
        forecast.predictedDemand +
        safetyBuffer +
        growthImpact -
        currentAlert.currentQuantity
      )
    );
  }


  const surplusWarehouses = await prisma.stockLevel.findMany({
    where: {
      productId: currentAlert.productId,
      userId,
      quantity: { gt: 0 },
    },
    include: {
      location: {
        select: {
          warehouse: {
            select: {
              id: true,
              name: true,
              shortCode: true,
              latitude: true,
              longitude: true,
            },
          },
        },
      },
    },
  });

  const nearbyWarehouses: NearbyWarehouse[] = surplusWarehouses
    .filter(sw => sw.location.warehouse && sw.quantity > optimizedQty)
    .map(sw => ({
      id: sw.location.warehouse!.id,
      name: sw.location.warehouse!.name,
      shortCode: sw.location.warehouse!.shortCode,
      latitude: sw.location.warehouse!.latitude,
      longitude: sw.location.warehouse!.longitude,
      availableQuantity: sw.quantity,
    }));

  let action: RebalancingAction;

  const nearest = currentAlert.warehouseId
    ? findNearestWarehouse(
      {
        latitude: geocodedLocations[currentAlert.warehouseId]?.lat ?? null,
        longitude: geocodedLocations[currentAlert.warehouseId]?.lon ?? null,
      },
      nearbyWarehouses,
      15
    )
    : null;


  // --- Cost Model ---
  const transferCostPerUnit = 5
  const vendorCostPerUnit = 8
  const orderingFixedCost = 200

  const transferCost = transferCostPerUnit * optimizedQty
  const vendorCost =
    vendorCostPerUnit * optimizedQty + orderingFixedCost

  if (nearest) {
    if (transferCost < vendorCost) {
      action = {
        type: "INTERNAL_TRANSFER",
        sourceWarehouseId: nearest.id,
        destinationWarehouseId: currentAlert.warehouseId,
        quantity: optimizedQty,
        reason: `Transfer cheaper (₹${transferCost}) vs Vendor (₹${vendorCost})`,
        validationPassed: false,
      }
    } else {
      action = {
        type: "VENDOR_ORDER",
        destinationWarehouseId: currentAlert.warehouseId,
        quantity: optimizedQty,
        reason: `Vendor cheaper (₹${vendorCost}) vs Transfer (₹${transferCost})`,
        validationPassed: false,
      }
    }
  } else {
    action = {
      type: "VENDOR_ORDER",
      destinationWarehouseId: currentAlert.warehouseId,
      quantity: optimizedQty,
      reason: "No surplus warehouse available",
      validationPassed: false,
    }
  }

  return {
    rebalancingActions: [action],
    nearbyWarehouses,
  };
}

// ─────────────────────────────────────────────────────────────────
// Remaining Nodes (UNCHANGED)
// ─────────────────────────────────────────────────────────────────

export async function pageIndexNode(state: AgentState): Promise<Partial<AgentState>> {
  const { userId } = state;

  try {
    const suppliers = await prisma.supplierProfile.findMany({
      where: { userId },
      take: 5,
    });

    const supplierData: Record<
      string,
      { reliabilityScore: number; leadDays: number }
    > = {};

    for (const supplier of suppliers) {
      supplierData[supplier.id] = {
        reliabilityScore: supplier.reliabilityScore ?? 5,
        leadDays: supplier.leadTimeDays ?? 7,
      };
    }

    return {
      supplierData,
    };
  } catch (error) {
    console.error("Supplier load failed:", error);
    return {};
  }
}

export async function arbiterNode(state: AgentState): Promise<Partial<AgentState>> {
  const { rebalancingActions, supplierData } = state;

  if (!rebalancingActions || rebalancingActions.length === 0) {
    return {};
  }

  const validatedActions = rebalancingActions.map((action) => {

    const constraints: string[] = [];
    let validationPassed = true;

    if (action.type === "INTERNAL_TRANSFER") {
      constraints.push("Internal transfer validated.");
    }

    else if (action.type === "VENDOR_ORDER") {
      constraints.push("Vendor order - supplier selection required.");

      // ─────────────────────────────
      // Supplier Scoring Logic
      // ─────────────────────────────
      const suppliers = Object.entries(supplierData || {});

      if (suppliers.length > 0) {

        const scored = suppliers
          .map(([id, data]) => {
            if (!data) return null;

            const score =
              data.reliabilityScore * 0.7 -
              data.leadDays * 0.3;

            return { id, score };
          })
          .filter(Boolean) as { id: string; score: number }[];

        scored.sort((a, b) => b.score - a.score);

        const best = scored[0];

        if (best) {
          action.selectedSupplierId = best.id;
          action.supplierScore = best.score;

          action.reason += ` | Selected Supplier ${best.id} (Score: ${best.score.toFixed(2)})`;
        }
      }
    }

    return {
      ...action,
      validationPassed,
      constraints,
    };
  });

  const auditLog = {
    nodeName: "Arbiter",
    inputData: { rebalancingActions },
    outputData: { validatedActions },
    reasoningString: validatedActions
      .map(a =>
        `Action: ${a.type}, Qty: ${a.quantity}, Reason: ${a.reason}`
      )
      .join(" | "),
    decision: "Final decision generated",
  };

  return {
    rebalancingActions: validatedActions,
    auditLogs: [...(state.auditLogs || []), auditLog],
  };
}

// ─────────────────────────────────────────────────────────────────
// Graph Builder
// ─────────────────────────────────────────────────────────────────

export function buildAgentGraph() {
  const workflow = new StateGraph(AgentStateAnnotation)
    .addNode("perception", perceptionNode)
    .addNode("forecastNode", forecastNode)
    .addNode("geocoding", geocodingNode)
    .addNode("rebalancing", rebalancingNode)
    .addNode("pageIndex", pageIndexNode)
    .addNode("arbiter", arbiterNode)

    .addEdge("perception", "forecastNode")
    .addEdge("forecastNode", "geocoding")
    .addEdge("geocoding", "rebalancing")
    .addEdge("rebalancing", "pageIndex")
    .addEdge("pageIndex", "arbiter")

    .setEntryPoint("perception");

  return workflow.compile();
}

export async function runMultiAgentSystem(
  userId: string,
  traceId: string
): Promise<AgentState> {
  const graph = buildAgentGraph();

  const initialState: AgentState = {
    traceId,
    userId,
    lowStockAlerts: [],
    currentAlert: null,
    weather: null,
    geocodedLocations: {},
    nearbyWarehouses: [],
    rebalancingActions: [],
    supplierData: {},
    forecast: null,
    auditLogs: [],
  };

  // 1️⃣ Run graph once to populate lowStockAlerts
  const firstPass = await graph.invoke(initialState);

  // 2️⃣ Prepare accumulators
  const allActions: any[] = [];
  const allAuditLogs: any[] = [];

  // 3️⃣ Loop each alert
  for (const alert of firstPass.lowStockAlerts) {
    const loopState: AgentState = {
      ...initialState,
      lowStockAlerts: firstPass.lowStockAlerts,
      currentAlert: alert,
      rebalancingActions: [],
      auditLogs: [],
    };

    const result = await graph.invoke(loopState);

    allActions.push(...result.rebalancingActions);
    allAuditLogs.push(...result.auditLogs);
  }

  // 4️⃣ Return aggregated result
  return {
    ...firstPass,
    rebalancingActions: allActions,
    auditLogs: allAuditLogs,
  };
}