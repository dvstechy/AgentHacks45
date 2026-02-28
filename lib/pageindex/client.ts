/**
 * PageIndex API Client
 * Provides methods to interact with PageIndex.ai for supplier contract analysis
 * Uses the Reasoning-based RAG (Retrieval) API for document intelligence
 * 
 * API Docs: https://docs.pageindex.ai/endpoints
 * MCP Config: https://api.pageindex.ai/mcp
 */

const PAGEINDEX_API_URL = "https://api.pageindex.ai";

let useBackupKey = false;

function getApiKey(): string {
    if (useBackupKey) {
        const backup = process.env.PAGEINDEX_API_KEY_BACKUP;
        if (backup) return backup;
    }
    const key = process.env.PAGEINDEX_API_KEY;
    if (!key) {
        throw new Error("PAGEINDEX_API_KEY environment variable is not set");
    }
    return key;
}

/** Switch to backup key on rate limit / auth failure */
function switchToBackupIfNeeded(status: number): boolean {
    if ((status === 429 || status === 401 || status === 403) && !useBackupKey && process.env.PAGEINDEX_API_KEY_BACKUP) {
        console.warn(`[PageIndex] Primary key hit limit (${status}), switching to backup key`);
        useBackupKey = true;
        return true; // caller should retry
    }
    return false;
}

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export interface PageIndexDocument {
    id: string;
    name: string;
    description?: string;
    status: "pending" | "processing" | "completed" | "failed";
    createdAt: string;
    pageNum?: number;
}

export interface PageIndexChatResponse {
    id: string;
    choices: {
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }[];
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

export interface SupplierContractInfo {
    supplierName?: string;
    rebateTiers?: {
        minVolume: number;
        maxVolume?: number;
        discountPercent: number;
        tier: string;
    }[];
    leadTimeDays?: number;
    minimumOrderQuantity?: number;
    paymentTerms?: string;
    contractExpiry?: string;
    coldChainRequired?: boolean;
    rawResponse: string;
}

// ─────────────────────────────────────────────────────────────────
// API Methods
// ─────────────────────────────────────────────────────────────────

/**
 * List all documents uploaded to PageIndex
 */
export async function listDocuments(
    limit: number = 50,
    offset: number = 0
): Promise<{ documents: PageIndexDocument[]; total: number }> {
    const response = await fetch(
        `${PAGEINDEX_API_URL}/docs?limit=${limit}&offset=${offset}`,
        {
            headers: { api_key: getApiKey() },
        }
    );

    if (!response.ok) {
        if (switchToBackupIfNeeded(response.status)) {
            return listDocuments(limit, offset); // retry with backup
        }
        throw new Error(`PageIndex list docs failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

/**
 * Get document metadata
 */
export async function getDocumentMetadata(
    docId: string
): Promise<PageIndexDocument> {
    const response = await fetch(
        `${PAGEINDEX_API_URL}/doc/${docId}/metadata`,
        {
            headers: { api_key: getApiKey() },
        }
    );

    if (!response.ok) {
        throw new Error(`PageIndex get metadata failed: ${response.status}`);
    }

    return response.json();
}

/**
 * Upload a supplier contract PDF to PageIndex
 */
export async function submitDocument(
    fileBuffer: ArrayBuffer,
    fileName: string,
    mode: "mcp" | "default" = "mcp"
): Promise<{ doc_id: string }> {
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: "application/pdf" });
    formData.append("file", blob, fileName);
    if (mode === "mcp") {
        formData.append("mode", "mcp");
    }

    const response = await fetch(`${PAGEINDEX_API_URL}/doc/`, {
        method: "POST",
        headers: { api_key: getApiKey() },
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`PageIndex submit doc failed: ${response.status}`);
    }

    return response.json();
}

/**
 * Chat with PageIndex documents to extract contract information
 * This is the core method for querying supplier contracts
 */
export async function chatWithDocuments(
    query: string,
    docId?: string | string[]
): Promise<PageIndexChatResponse> {
    const body: Record<string, unknown> = {
        messages: [{ role: "user", content: query }],
        stream: false,
    };

    if (docId) {
        body.doc_id = docId;
    }

    const response = await fetch(`${PAGEINDEX_API_URL}/chat/completions`, {
        method: "POST",
        headers: {
            api_key: getApiKey(),
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        if (switchToBackupIfNeeded(response.status)) {
            return chatWithDocuments(query, docId); // retry with backup
        }
        const errorText = await response.text().catch(() => "");
        throw new Error(
            `PageIndex chat failed: ${response.status} ${response.statusText} - ${errorText}`
        );
    }

    return response.json();
}

/**
 * Query supplier contracts for volume-based rebate tiers
 * This is the main function used by the PageIndex node in the agent graph
 */
export async function querySupplierContracts(
    productName: string,
    quantity: number,
    supplierName?: string,
    docId?: string | string[]
): Promise<SupplierContractInfo> {
    const query = buildContractQuery(productName, quantity, supplierName);

    try {
        const response = await chatWithDocuments(query, docId);

        const content =
            response.choices?.[0]?.message?.content || "No contract data found";

        // Parse the response into structured data
        return parseContractResponse(content, productName, quantity);
    } catch (error) {
        console.error("PageIndex contract query failed:", error);
        return {
            rawResponse: `Error querying contracts: ${error instanceof Error ? error.message : String(error)}`,
        };
    }
}

/**
 * Query all available documents for supplier-related content
 */
export async function findSupplierDocuments(): Promise<PageIndexDocument[]> {
    try {
        const { documents } = await listDocuments(100, 0);
        // Filter for supplier/contract related documents
        return documents.filter(
            (doc) =>
                doc.status === "completed" &&
                (doc.name?.toLowerCase().includes("supplier") ||
                    doc.name?.toLowerCase().includes("contract") ||
                    doc.name?.toLowerCase().includes("vendor") ||
                    doc.name?.toLowerCase().includes("agreement") ||
                    doc.description?.toLowerCase().includes("supplier") ||
                    doc.description?.toLowerCase().includes("contract"))
        );
    } catch {
        console.warn("Could not list PageIndex documents");
        return [];
    }
}

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

function buildContractQuery(
    productName: string,
    quantity: number,
    supplierName?: string
): string {
    const parts = [
        `I need to find volume-based rebate tiers and contract terms for ordering "${productName}".`,
        `Order quantity is approximately ${quantity} units.`,
    ];

    if (supplierName) {
        parts.push(`Specifically looking at contracts with supplier: "${supplierName}".`);
    }

    parts.push(
        "Please provide:",
        "1. Volume-based rebate/discount tiers (e.g., 100-500 units = 5% discount)",
        "2. Lead time (days)",
        "3. Minimum order quantity",
        "4. Payment terms",
        "5. Contract expiry date",
        "6. Any cold chain or special handling requirements",
        "7. Any relevant clauses about bulk pricing or penalties"
    );

    return parts.join("\n");
}

function parseContractResponse(
    content: string,
    productName: string,
    quantity: number
): SupplierContractInfo {
    const info: SupplierContractInfo = {
        rawResponse: content,
    };

    // Try to extract rebate tiers from the response
    const tierPatterns = [
        /(\d+)\s*[-–to]+\s*(\d+)\s*units?\s*[=:→]\s*(\d+(?:\.\d+)?)\s*%/gi,
        /tier\s*\d*\s*[:\-]\s*(\d+).*?(\d+(?:\.\d+)?)\s*%/gi,
    ];

    const tiers: SupplierContractInfo["rebateTiers"] = [];
    for (const pattern of tierPatterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
            tiers.push({
                minVolume: parseInt(match[1]),
                maxVolume: match[2] ? parseInt(match[2]) : undefined,
                discountPercent: parseFloat(match[3] || match[2]),
                tier: `${match[1]}-${match[2] || "+"} units`,
            });
        }
    }
    if (tiers.length > 0) {
        info.rebateTiers = tiers;
    }

    // Extract lead time
    const leadTimeMatch = content.match(
        /lead\s*time[:\s]*(\d+)\s*(?:business\s*)?days?/i
    );
    if (leadTimeMatch) {
        info.leadTimeDays = parseInt(leadTimeMatch[1]);
    }

    // Extract MOQ
    const moqMatch = content.match(
        /minimum\s*order\s*(?:quantity|qty)?[:\s]*(\d+)/i
    );
    if (moqMatch) {
        info.minimumOrderQuantity = parseInt(moqMatch[1]);
    }

    // Extract cold chain requirement
    if (
        content.match(
            /cold\s*chain|refrigerat|temperature\s*control|frozen|chilled/i
        )
    ) {
        info.coldChainRequired = true;
    }

    return info;
}
