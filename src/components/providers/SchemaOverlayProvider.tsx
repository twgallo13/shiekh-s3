"use client";
import React, { useEffect } from "react";
import { useSchemaOverlay } from "@/components/dev/SchemaOverlay";
import { setValidationEntryCallback } from "@/lib/client/http";

interface SchemaOverlayProviderProps {
  children: React.ReactNode;
}

/**
 * Schema Overlay Provider - Development Only
 * Provides schema validation overlay functionality
 * Connects http.ts validation to the overlay component
 */
export default function SchemaOverlayProvider({ children }: SchemaOverlayProviderProps) {
  const { SchemaOverlayComponent } = useSchemaOverlay();

  // Connect http.ts validation to overlay
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // This will be set by the SchemaOverlay component
      // We just need to ensure the provider is mounted
    }
  }, []);

  return (
    <>
      {children}
      {SchemaOverlayComponent}
    </>
  );
}
