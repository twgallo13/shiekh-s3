"use client";
import React, { useState, useEffect } from "react";
import MarkdownViewer from "@/components/ui/MarkdownViewer";
import { APP_VERSION } from "@/app/version";

export default function DocsPage() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStructure = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch("/docs/structure.md");
        if (!response.ok) {
          throw new Error(`Failed to fetch structure.md: ${response.status}`);
        }
        
        const text = await response.text();
        setContent(text);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load documentation");
      } finally {
        setLoading(false);
      }
    };

    fetchStructure();
  }, []);

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading documentation...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Documentation</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Banner */}
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h1 className="text-2xl font-bold text-blue-900 mb-2">
            Shiekh S3 Master Specification v14.0.0
          </h1>
          <p className="text-blue-800 font-medium">
            Single Source of Truth
          </p>
          <p className="text-sm text-blue-700 mt-2">
            This is a read-only reference viewer. The specification is maintained in the repository root.
          </p>
        </div>

        {/* Navigation */}
        <nav className="mb-6" aria-label="Documentation navigation">
          <div className="flex items-center gap-4 text-sm">
            <a 
              href="/" 
              className="text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            >
              ← Back to Dashboard
            </a>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">App Version: {APP_VERSION}</span>
          </div>
        </nav>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <MarkdownViewer content={content} />
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-gray-200">
          <div className="text-center text-sm text-gray-600">
            <p>
              This documentation is automatically generated from the master specification.
              For the most up-to-date version, refer to the repository.
            </p>
            <p className="mt-2">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
