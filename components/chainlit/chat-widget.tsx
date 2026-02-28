/**
 * Floating Chatbot Widget
 * A sleek, slide-up chat panel that can be toggled from any dashboard page
 * Built with @chainlit/react-client provider pattern
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { ChainlitChatbot } from "@/components/chainlit/chatbot";
import { ChainlitProvider } from "@/components/chainlit/provider";
import { useChatStream } from "@/lib/chainlit/hooks";
import { MessageSquare, X, Minus } from "lucide-react";

// Inner wrapper that uses the hook and passes streamState
function ChatbotWithStream() {
    const streamState = useChatStream();
    return <ChainlitChatbot streamState={streamState} />;
}

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const mountedRef = useRef(false);

    // Avoid SSR hydration mismatch
    useEffect(() => {
        mountedRef.current = true;
    }, []);

    // Use state for conditional render after first paint
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        // Schedule mount in next tick to avoid render-phase setState
        const id = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(id);
    }, []);

    if (!mounted) return null;

    return (
        <>
            {/* Chat Panel */}
            {isOpen && (
                <div
                    className={`fixed bottom-20 right-5 z-50 transition-all duration-300 ease-out ${isMinimized
                        ? "w-72 h-14"
                        : "w-[420px] h-[600px] max-h-[80vh]"
                        }`}
                    style={{
                        animation: "slideUp 0.3s ease-out forwards",
                    }}
                >
                    <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl shadow-black/20 dark:shadow-black/50 border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-900">
                        {/* Mini Header (for minimized state) */}
                        {isMinimized ? (
                            <div
                                className="flex items-center justify-between px-4 h-full cursor-pointer bg-gradient-to-r from-orange-500 to-red-500 text-white"
                                onClick={() => setIsMinimized(false)}
                            >
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" />
                                    <span className="text-sm font-semibold">SprintStock AI</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsMinimized(false);
                                        }}
                                        className="w-7 h-7 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors"
                                    >
                                        <MessageSquare className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsOpen(false);
                                            setIsMinimized(false);
                                        }}
                                        className="w-7 h-7 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col">
                                {/* Window Controls */}
                                <div className="flex items-center justify-end gap-1 px-3 pt-2 pb-0 bg-white dark:bg-slate-900">
                                    <button
                                        onClick={() => setIsMinimized(true)}
                                        className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                        title="Minimize"
                                    >
                                        <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsOpen(false);
                                            setIsMinimized(false);
                                        }}
                                        className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                                        title="Close"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                {/* Chatbot Content */}
                                <div className="flex-1 min-h-0">
                                    <ChainlitProvider>
                                        <ChatbotWithStream />
                                    </ChainlitProvider>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Floating Action Button */}
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    setIsMinimized(false);
                    setHasNewMessage(false);
                }}
                className={`fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ease-out group ${isOpen
                    ? "bg-slate-800 dark:bg-slate-200 hover:bg-slate-700 dark:hover:bg-slate-300 scale-90"
                    : "bg-gradient-to-br from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-xl shadow-orange-500/30 hover:shadow-orange-500/40 hover:scale-105"
                    }`}
            >
                {isOpen ? (
                    <X className="w-5 h-5 text-white dark:text-slate-900 transition-transform group-hover:rotate-90 duration-200" />
                ) : (
                    <>
                        <MessageSquare className="w-5 h-5 text-white transition-transform group-hover:scale-110 duration-200" />
                        {hasNewMessage && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
                        )}
                    </>
                )}
            </button>

            {/* CSS Animation */}
            <style jsx global>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
        </>
    );
}
