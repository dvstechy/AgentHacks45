/**
 * Chainlit React Provider
 * Wraps the application with required Recoil state management
 * and Chainlit context for the chat system
 */

"use client";

import { ChainlitContext } from "@chainlit/react-client";
import { RecoilRoot } from "recoil";
import { apiClient } from "@/lib/chainlit/client";

interface ChainlitProviderProps {
    children: React.ReactNode;
}

export function ChainlitProvider({ children }: ChainlitProviderProps) {
    return (
        <ChainlitContext.Provider value={apiClient}>
            <RecoilRoot>{children}</RecoilRoot>
        </ChainlitContext.Provider>
    );
}
