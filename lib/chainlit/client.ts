/**
 * Chainlit Client Configuration
 * Sets up the ChainlitAPI instance and context for the React app
 */

import { ChainlitAPI } from "@chainlit/react-client";

// Chainlit API endpoint - points to our Next.js streaming API
const CHAINLIT_SERVER_URL = process.env.NEXT_PUBLIC_CHAINLIT_URL || "";

export const apiClient = new ChainlitAPI(CHAINLIT_SERVER_URL, "webapp");
