"use client";
import React, { useState, useEffect } from "react";

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

/**
 * Simple markdown viewer component
 * Renders GitHub-flavored markdown with basic styling
 * Includes table of contents and in-page anchors
 */
export default function MarkdownViewer({ content, className = "" }: MarkdownViewerProps) {
  const [html, setHtml] = useState("");
  const [toc, setToc] = useState<Array<{ id: string; text: string; level: number }>>([]);

  useEffect(() => {
    // Simple markdown to HTML converter
    let htmlContent = content
      // Headers with IDs for anchors
      .replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, text) => {
        const level = hashes.length;
        const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
        return `<h${level} id="${id}" class="markdown-heading markdown-h${level}">${text}</h${level}>`;
      })
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic text
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre class="markdown-code-block"><code>$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="markdown-inline-code">$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="markdown-link">$1</a>')
      // Lists
      .replace(/^[\s]*[-*+]\s+(.+)$/gm, '<li class="markdown-list-item">$1</li>')
      .replace(/(<li class="markdown-list-item">.*<\/li>)/s, '<ul class="markdown-list">$1</ul>')
      // Ordered lists
      .replace(/^[\s]*\d+\.\s+(.+)$/gm, '<li class="markdown-list-item">$1</li>')
      .replace(/(<li class="markdown-list-item">.*<\/li>)/s, '<ol class="markdown-list">$1</ol>')
      // Paragraphs
      .replace(/^(?!<[h|u|o|l|p|d|s])(.+)$/gm, '<p class="markdown-paragraph">$1</p>')
      // Line breaks
      .replace(/\n/g, '<br>');

    setHtml(htmlContent);

    // Generate table of contents
    const tocItems: Array<{ id: string; text: string; level: number }> = [];
    const headerRegex = /^#{1,6}\s+(.+)$/gm;
    let match;
    while ((match = headerRegex.exec(content)) !== null) {
      const level = match[0].match(/^#+/)?.[0].length || 1;
      const text = match[1];
      const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
      tocItems.push({ id, text, level });
    }
    setToc(tocItems);
  }, [content]);

  return (
    <div className={`markdown-viewer ${className}`}>
      {/* Skip to content link for accessibility */}
      <a href="#markdown-content" className="sr-only focus:not-sr-only absolute left-2 top-2 bg-black text-white px-3 py-1 rounded">
        Skip to content
      </a>
      
      {/* Table of Contents */}
      {toc.length > 0 && (
        <nav className="markdown-toc mb-8 p-4 bg-gray-50 border rounded-lg" aria-label="Table of contents">
          <h2 className="text-lg font-semibold mb-3">Table of Contents</h2>
          <ul className="space-y-1">
            {toc.map((item, index) => (
              <li key={index} className={`markdown-toc-item markdown-toc-level-${item.level}`}>
                <a 
                  href={`#${item.id}`}
                  className="markdown-toc-link hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Main content */}
      <div 
        id="markdown-content"
        className="markdown-content prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <style jsx>{`
        .markdown-viewer {
          line-height: 1.6;
        }
        
        .markdown-heading {
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-weight: 600;
          scroll-margin-top: 2rem;
        }
        
        .markdown-h1 {
          font-size: 2rem;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 0.5rem;
        }
        
        .markdown-h2 {
          font-size: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 0.25rem;
        }
        
        .markdown-h3 {
          font-size: 1.25rem;
        }
        
        .markdown-h4 {
          font-size: 1.125rem;
        }
        
        .markdown-h5 {
          font-size: 1rem;
        }
        
        .markdown-h6 {
          font-size: 0.875rem;
        }
        
        .markdown-paragraph {
          margin-bottom: 1rem;
        }
        
        .markdown-list {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        
        .markdown-list-item {
          margin-bottom: 0.5rem;
        }
        
        .markdown-code-block {
          background-color: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          padding: 1rem;
          margin: 1rem 0;
          overflow-x: auto;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
        }
        
        .markdown-inline-code {
          background-color: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 0.25rem;
          padding: 0.125rem 0.25rem;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
        }
        
        .markdown-link {
          color: #2563eb;
          text-decoration: underline;
        }
        
        .markdown-link:hover {
          color: #1d4ed8;
        }
        
        .markdown-link:focus {
          outline: 2px solid #2563eb;
          outline-offset: 2px;
        }
        
        .markdown-toc {
          position: sticky;
          top: 1rem;
        }
        
        .markdown-toc-item {
          list-style: none;
        }
        
        .markdown-toc-level-1 {
          font-weight: 600;
        }
        
        .markdown-toc-level-2 {
          padding-left: 1rem;
        }
        
        .markdown-toc-level-3 {
          padding-left: 2rem;
        }
        
        .markdown-toc-level-4 {
          padding-left: 3rem;
        }
        
        .markdown-toc-level-5 {
          padding-left: 4rem;
        }
        
        .markdown-toc-level-6 {
          padding-left: 5rem;
        }
        
        .markdown-toc-link {
          color: #374151;
          text-decoration: none;
          display: block;
          padding: 0.25rem 0;
        }
        
        .markdown-toc-link:hover {
          color: #2563eb;
        }
        
        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .markdown-heading {
            border-color: #000;
          }
          
          .markdown-code-block {
            border-color: #000;
            background-color: #fff;
          }
          
          .markdown-inline-code {
            border-color: #000;
            background-color: #fff;
          }
        }
        
        /* Dark mode support */
        .dark .markdown-toc {
          background-color: #374151;
          border-color: #4b5563;
        }
        
        .dark .markdown-code-block {
          background-color: #374151;
          border-color: #4b5563;
          color: #f9fafb;
        }
        
        .dark .markdown-inline-code {
          background-color: #374151;
          border-color: #4b5563;
          color: #f9fafb;
        }
        
        .dark .markdown-link {
          color: #60a5fa;
        }
        
        .dark .markdown-link:hover {
          color: #93c5fd;
        }
        
        .dark .markdown-toc-link {
          color: #d1d5db;
        }
        
        .dark .markdown-toc-link:hover {
          color: #60a5fa;
        }
      `}</style>
    </div>
  );
}
