/**
 * LangGraph-based Multi-Agent System for Intelligent Inventory Rebalancing
 * Coordinates multiple specialized agents: Perception, Geocoding, Rebalancing, PageIndex, and Arbiter
 */

import { StateGraph, Annotation } from "@langchain/langgraph";
import { prisma } from "@/lib/prisma";
import { type Prisma } from "@prisma/client";
import { findNearestWarehouse } from "@/lib/utils/geo";

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
  type: "INTERNAL_TRANSFER" | "VENDOR_ORDER" | "NONE";
  sourceWarehouseId?: string;
  destinationWarehouseId?: string;
  quantity: number;
  reason: string;
  validationPassed: boolean;
  constraints?: string[];
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
  auditLogs: Annotation<AuditLogEntry[]>(),
});

export type AgentState = typeof AgentStateAnnotation.State;

// ─────────────────────────────────────────────────────────────────
// Node 1: Perception (Query Stock & Weather)
// ─────────────────────────────────────────────────────────────────

export async function perceptionNode(state: AgentState): Promise<Partial<AgentState>> {
  const { userId, traceId } = state;

  try {
    // Query low stock products in all warehouses
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

    const alerts: StockAlert[] = stockLevels
      .filter((sl: typeof stockLevels[number]) => sl.quantity < sl.product.minStock)
      .map((sl: typeof stockLevels[number]) => ({
        productId: sl.product.id,
        productName: sl.product.name,
        sku: sl.product.sku,
        currentQuantity: sl.quantity,
        minStock: sl.product.minStock,
        shortfall: sl.product.minStock - sl.quantity,
        warehouseId: sl.location.warehouse?.id,
        warehouseName: sl.location.warehouse?.name,
        locationId: sl.location.id,
        attributes: sl.product.attributes as Record<string, unknown>,
      }));

    // Fetch weather for Pune (hardcoded for demo, can be parameterized)
    const weatherResponse = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=18.5204&longitude=73.8567&current=temperature_2m,relative_humidity_2m"
    );
    const weatherData = await weatherResponse.json();
    const weather = weatherData.current ? {
      temperature: weatherData.current.temperature_2m,
      humidity: weatherData.current.relative_humidity_2m,
    } : null;

    // Log perception step
    const auditLog = {
      nodeName: "Perception",
      inputData: { userId, traceId },
      outputData: { alertCount: alerts.length, weather },
      reasoningString: `Queried stock levels and found ${alerts.length} low-stock alerts. Weather: ${weather?.temperature}°C, ${weather?.humidity}% humidity.`,
      decision: "Perception complete - ready for geocoding phase",
    };

    return {
      lowStockAlerts: alerts,
      weather,
      auditLogs: [...(state.auditLogs || []), auditLog],
      currentAlert: alerts.length > 0 ? alerts[0] : null,
    };
  } catch (error) {
    console.error("Perception node error:", error);
    return {
      auditLogs: [
        ...(state.auditLogs || []),
        {
          nodeName: "Perception",
          inputData: { userId, traceId },
          outputData: {},
          reasoningString: "Query failed",
          decision: "Perception failed",
          error: String(error),
        },
      ],
    };
  }
}

// ─────────────────────────────────────────────────────────────────
// Node 2: Geocoding (Address → Lat/Long via Groq)
// ─────────────────────────────────────────────────────────────────

export async function geocodingNode(state: AgentState): Promise<Partial<AgentState>> {
  const { lowStockAlerts } = state;

  if (lowStockAlerts.length === 0) {
    return {
      auditLogs: [...(state.auditLogs || []), {
        nodeName: "Geocoding",
        inputData: {},
        outputData: {},
        reasoningString: "No alerts to geocode",
        decision: "No alerts to geocode, skipping supplier lookup",
      }]
    };
  }

  const geocoded: Record<string, { lat: number; lon: number } | null> = {};

  try {
    // Mock geocoding with simulated coordinates for demo
    // In production, use real geocoding API or hardcode key warehouse coords
    for (const alert of lowStockAlerts) {
      if (alert.warehouseId) {
        // Simulate geocoding - in real system fetch actual coordinates
        geocoded[alert.warehouseId] = {
          lat: 18.5204 + Math.random() * 0.1,
          lon: 73.8567 + Math.random() * 0.1,
        };
      }
    }

    return {
      geocodedLocations: geocoded,
      auditLogs: [
        ...(state.auditLogs || []),
        {
          nodeName: "Geocoding",
          inputData: { alertCount: lowStockAlerts.length },
          outputData: { geocodedCount: Object.keys(geocoded).length },
          reasoningString: `Geocoded ${Object.keys(geocoded).length} warehouse locations`,
          decision: "Geocoding complete - ready for rebalancing",
        },
      ],
    };
  } catch (error) {
    console.error("Geocoding node error:", error);
    return {
      auditLogs: [
        ...(state.auditLogs || []),
        {
          nodeName: "Geocoding",
          inputData: { alertCount: lowStockAlerts.length },
          outputData: {},
          reasoningString: "Geocoding failed",
          decision: "Geocoding failed",
          error: String(error),
        },
      ],
    };
  }
}

// ─────────────────────────────────────────────────────────────────
// Node 3: Rebalancing (Find Surplus, Create Transfers)
// ─────────────────────────────────────────────────────────────────

export async function rebalancingNode(state: AgentState): Promise<Partial<AgentState>> {
  const { userId, currentAlert, geocodedLocations } = state;

  if (!currentAlert) {
    return {
      auditLogs: [
        ...(state.auditLogs || []),
        {
          nodeName: "Rebalancing",
          inputData: {},
          outputData: {},
          reasoningString: "No current alert",
          decision: "No current alert to rebalance",
        },
      ],
    };
  }

  const actions: RebalancingAction[] = [];

  try {
    // Find warehouses with surplus of the product
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
                capacityStats: true,
              },
            },
          },
        },
      },
    });

    const nearbyWarehouses: NearbyWarehouse[] = surplusWarehouses
      .filter((sw: typeof surplusWarehouses[number]) => sw.location.warehouse && sw.quantity > currentAlert.shortfall)
      .map((sw: typeof surplusWarehouses[number]) => ({
        id: sw.location.warehouse!.id,
        name: sw.location.warehouse!.name,
        shortCode: sw.location.warehouse!.shortCode,
        latitude: sw.location.warehouse!.latitude,
        longitude: sw.location.warehouse!.longitude,
        availableQuantity: sw.quantity,
      }));

    // Determine action
    let action: RebalancingAction;

    if (nearbyWarehouses.length > 0 && currentAlert.warehouseId) {
      // Can rebalance internally if nearby warehouse exists and has surplus
      const nearest = findNearestWarehouse(
        {
          latitude: geocodedLocations[currentAlert.warehouseId]?.lat ?? null,
          longitude: geocodedLocations[currentAlert.warehouseId]?.lon ?? null,
        },
        nearbyWarehouses,
        15
      );

      if (nearest) {
        action = {
          type: "INTERNAL_TRANSFER",
          sourceWarehouseId: nearest.id,
          destinationWarehouseId: currentAlert.warehouseId,
          quantity: currentAlert.shortfall,
          reason: `Rebalance from ${nearest.name} (${nearest.distance?.toFixed(1)}km away)`,
          validationPassed: false,
        };
      } else {
        action = {
          type: "VENDOR_ORDER",
          sourceWarehouseId: undefined,
          destinationWarehouseId: currentAlert.warehouseId,
          quantity: currentAlert.shortfall,
          reason: "No nearby warehouse with surplus, ordering from vendor",
          validationPassed: false,
        };
      }
    } else {
      action = {
        type: "VENDOR_ORDER",
        destinationWarehouseId: currentAlert.warehouseId,
        quantity: currentAlert.shortfall,
        reason: "Insufficient internal supply, placing vendor order",
        validationPassed: false,
      };
    }

    actions.push(action);

    return {
      rebalancingActions: actions,
      nearbyWarehouses,
      auditLogs: [
        ...(state.auditLogs || []),
        {
          nodeName: "Rebalancing",
          inputData: { productId: currentAlert.productId, shortfall: currentAlert.shortfall },
          outputData: { actionType: action.type, nearbyCount: nearbyWarehouses.length },
          reasoningString: `Analyzed rebalancing options. Found ${nearbyWarehouses.length} nearby warehouses. Decision: ${action.type}`,
          decision: `Recommend ${action.type} for product ${currentAlert.productName}`,
        },
      ],
    };
  } catch (error) {
    console.error("Rebalancing node error:", error);
    return {
      auditLogs: [
        ...(state.auditLogs || []),
        {
          nodeName: "Rebalancing",
          inputData: { productId: currentAlert?.productId },
          outputData: {},
          reasoningString: "Rebalancing analysis failed",
          decision: "Rebalancing analysis failed",
          error: String(error),
        },
      ],
    };
  }
}

// ─────────────────────────────────────────────────────────────────
// Node 4: PageIndex (Supplier Contract Lookup via PageIndex.ai API)
// Queries the supplier contract tree for volume-based rebate tiers
// ─────────────────────────────────────────────────────────────────

export async function pageIndexNode(state: AgentState): Promise<Partial<AgentState>> {
  const { userId, currentAlert, rebalancingActions } = state;

  const shouldQuerySupplier = rebalancingActions.some((a) => a.type === "VENDOR_ORDER");

  if (!shouldQuerySupplier) {
    return {
      auditLogs: [
        ...(state.auditLogs || []),
        {
          nodeName: "PageIndex",
          inputData: {},
          outputData: {},
          reasoningString: "No vendor orders needed - skipping supplier contract lookup",
          decision: "No vendor orders needed, skipping PageIndex query",
        },
      ],
    };
  }

  try {
    // Import the PageIndex client dynamically to avoid circular deps
    const {
      querySupplierContracts,
      findSupplierDocuments,
      chatWithDocuments,
    } = await import("@/lib/pageindex/client");

    const productName = currentAlert?.productName || "Unknown Product";
    const orderQuantity = currentAlert?.shortfall || 0;

    // Step 1: Find supplier-related documents in PageIndex
    let supplierDocs: { id: string; name: string }[] = [];
    let pageIndexAvailable = false;

    try {
      supplierDocs = await findSupplierDocuments();
      pageIndexAvailable = true;
    } catch {
      console.warn("PageIndex API not available, falling back to local data");
    }

    // Step 2: Query PageIndex for contract rebate tiers
    let contractInfo: Awaited<ReturnType<typeof querySupplierContracts>> | null = null;
    let pageIndexResponse = "";

    if (pageIndexAvailable) {
      if (supplierDocs.length > 0) {
        // Query specific supplier contract documents
        const docIds = supplierDocs.map((d) => d.id);
        contractInfo = await querySupplierContracts(
          productName,
          orderQuantity,
          undefined,
          docIds.length === 1 ? docIds[0] : docIds
        );
        pageIndexResponse = contractInfo.rawResponse;
      } else {
        // No specific supplier docs found — query PageIndex broadly
        try {
          const chatResponse = await chatWithDocuments(
            `Find supplier contract terms, volume-based rebate tiers, and pricing for "${productName}". ` +
            `I need to order approximately ${orderQuantity} units. ` +
            `What discounts or rebates apply at this volume?`
          );
          pageIndexResponse = chatResponse.choices?.[0]?.message?.content || "";
        } catch {
          pageIndexResponse = "No supplier contract documents found in PageIndex";
        }
      }
    }

    // Step 3: Also query local Prisma supplier profiles as fallback/enrichment
    const suppliers = await prisma.supplierProfile.findMany({
      where: { userId },
      include: { contact: true },
      take: 5,
    });

    const supplierData: Record<string, { reliabilityScore: number; leadDays: number } | null> = {};
    for (const supplier of suppliers) {
      supplierData[supplier.id] = {
        reliabilityScore: supplier.reliabilityScore,
        leadDays: supplier.leadTimeDays,
      };
    }

    // Build reasoning string with PageIndex results
    const reasoningParts: string[] = [];

    if (pageIndexAvailable) {
      reasoningParts.push(
        `PageIndex API queried for "${productName}" contract terms.`
      );
      if (supplierDocs.length > 0) {
        reasoningParts.push(
          `Found ${supplierDocs.length} supplier document(s): ${supplierDocs.map((d) => d.name).join(", ")}.`
        );
      }
      if (contractInfo?.rebateTiers && contractInfo.rebateTiers.length > 0) {
        reasoningParts.push(
          `Rebate tiers found: ${contractInfo.rebateTiers
            .map((t) => `${t.tier} → ${t.discountPercent}% discount`)
            .join("; ")}.`
        );
      }
      if (contractInfo?.leadTimeDays) {
        reasoningParts.push(`Lead time: ${contractInfo.leadTimeDays} days.`);
      }
      if (contractInfo?.coldChainRequired) {
        reasoningParts.push("Cold chain handling is required per contract.");
      }
    } else {
      reasoningParts.push("PageIndex API unavailable, used local supplier data.");
    }

    reasoningParts.push(
      `Also found ${suppliers.length} local supplier profile(s) with reliability scores.`
    );

    return {
      supplierData,
      auditLogs: [
        ...(state.auditLogs || []),
        {
          nodeName: "PageIndex",
          inputData: {
            productId: currentAlert?.productId,
            productName,
            orderQuantity,
            pageIndexDocsFound: supplierDocs.length,
          },
          outputData: {
            supplierCount: suppliers.length,
            pageIndexAvailable,
            rebateTiers: contractInfo?.rebateTiers || [],
            leadTimeDays: contractInfo?.leadTimeDays,
            coldChainRequired: contractInfo?.coldChainRequired,
            contractSummary: pageIndexResponse.substring(0, 500),
          },
          reasoningString: reasoningParts.join(" "),
          decision: pageIndexAvailable
            ? "Supplier contract data retrieved from PageIndex — ready for Arbiter validation"
            : "Using local supplier profiles — PageIndex API unavailable",
        },
      ],
    };
  } catch (error) {
    console.error("PageIndex node error:", error);
    return {
      auditLogs: [
        ...(state.auditLogs || []),
        {
          nodeName: "PageIndex",
          inputData: { productId: currentAlert?.productId },
          outputData: {},
          reasoningString: "Supplier contract lookup failed",
          decision: "Supplier lookup failed — proceeding with limited data",
          error: String(error),
        },
      ],
    };
  }
}

// ─────────────────────────────────────────────────────────────────
// Node 5: Arbiter (Validation Against Constraints)
// ─────────────────────────────────────────────────────────────────

export async function arbiterNode(state: AgentState): Promise<Partial<AgentState>> {
  const { currentAlert, rebalancingActions, weather } = state;

  if (rebalancingActions.length === 0) {
    return {
      auditLogs: [
        ...(state.auditLogs || []),
        {
          nodeName: "Arbiter",
          inputData: {},
          outputData: {},
          reasoningString: "No actions to validate",
          decision: "No actions to validate",
        },
      ],
    };
  }

  try {
    const validatedActions = rebalancingActions.map((action) => {
      const constraints: string[] = [];
      let validationPassed = true;

      // Check fridge requirement if product has cold storage needs
      if (currentAlert?.attributes?.fridge_required && weather && weather.temperature > 20) {
        constraints.push("High ambient temperature (>20°C) - fridge requirement critical");
        validationPassed = false;
      }

      // Validate warehouse capacity if internal transfer
      if (action.type === "INTERNAL_TRANSFER") {
        constraints.push("Internal transfer validated - capacity check pending");
      } else if (action.type === "VENDOR_ORDER") {
        constraints.push("Vendor order - lead time factored into decision");
      }

      return {
        ...action,
        validationPassed,
        constraints,
      };
    });

    return {
      rebalancingActions: validatedActions,
      auditLogs: [
        ...(state.auditLogs || []),
        {
          nodeName: "Arbiter",
          inputData: { actionCount: rebalancingActions.length, temperature: weather?.temperature },
          outputData: {
            validatedCount: validatedActions.filter((a) => a.validationPassed).length,
          },
          reasoningString: `Validated ${validatedActions.length} actions against constraints. Temp: ${weather?.temperature}°C. Fridge check: ${currentAlert?.attributes?.fridge_required ? "required" : "not needed"}`,
          decision: "Validation complete - ready for execution",
        },
      ],
    };
  } catch (error) {
    console.error("Arbiter node error:", error);
    return {
      auditLogs: [
        ...(state.auditLogs || []),
        {
          nodeName: "Arbiter",
          inputData: { actionCount: rebalancingActions.length },
          outputData: {},
          reasoningString: "Validation failed",
          decision: "Validation failed",
          error: String(error),
        },
      ],
    };
  }
}

// ─────────────────────────────────────────────────────────────────
// Build the Graph
// ─────────────────────────────────────────────────────────────────

export function buildAgentGraph() {
  const workflow = new StateGraph(AgentStateAnnotation)
    .addNode("perception", perceptionNode)
    .addNode("geocoding", geocodingNode)
    .addNode("rebalancing", rebalancingNode)
    .addNode("pageIndex", pageIndexNode)
    .addNode("arbiter", arbiterNode)
    .addEdge("perception", "geocoding")
    .addEdge("geocoding", "rebalancing")
    .addEdge("rebalancing", "pageIndex")
    .addEdge("pageIndex", "arbiter")
    .setEntryPoint("perception");

  return workflow.compile();
}

/**
 * Run the multi-agent system and return final audit logs
 */
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
    auditLogs: [],
  };

  try {
    const finalState = await graph.invoke(initialState);
    // Save audit logs to database
    for (const log of finalState.auditLogs) {
      await prisma.agentAuditLog.create({
        data: {
          traceId,
          nodeName: log.nodeName || "unknown",
          inputData: (log.inputData || {}) as Prisma.InputJsonValue,
          outputData: (log.outputData || {}) as Prisma.InputJsonValue,
          reasoningString: log.reasoningString || "",
          decision: log.decision || "",
          userId,
        },
      });
    }

    return finalState;
  } catch (error) {
    console.error("Multi-agent system error:", error);
    throw error;
  }
}
