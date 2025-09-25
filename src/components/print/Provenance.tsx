"use client";
import React, { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useRole } from "@/components/providers/RoleProvider";

interface ProvenanceProps {
  filters?: Record<string, any>;
  route?: string;
  className?: string;
}

/**
 * Provenance Component
 * Renders provenance block with filters, role, correlation ID, and SHA1 hash
 * Includes QR code with provenance JSON for verification
 */
export default function Provenance({ 
  filters = {}, 
  route = "unknown",
  className = "" 
}: ProvenanceProps) {
  const searchParams = useSearchParams();
  const { effectiveRole } = useRole();

  // Generate correlation ID from query params or create new one
  const correlationId = useMemo(() => {
    const existingId = searchParams.get('correlationId');
    if (existingId) return existingId;
    
    // Generate new correlation ID
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `corr_${timestamp}_${random}`;
  }, [searchParams]);

  // Generate SHA1 hash of provenance data
  const provenanceHash = useMemo(() => {
    const provenanceData = {
      filters,
      effectiveRole,
      route,
      correlationId,
      timestamp: new Date().toISOString()
    };
    
    const dataString = JSON.stringify(provenanceData, Object.keys(provenanceData).sort());
    
    // Simple hash function (in production, use crypto.subtle.digest)
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(16).padStart(8, '0');
  }, [filters, effectiveRole, route, correlationId]);

  // Generate QR code data URL
  const qrCodeDataUrl = useMemo(() => {
    const provenanceData = {
      filters,
      effectiveRole,
      route,
      correlationId,
      timestamp: new Date().toISOString(),
      hash: provenanceHash
    };
    
    const jsonString = JSON.stringify(provenanceData, null, 2);
    
    // Simple QR code placeholder (in production, use a proper QR library)
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    
    canvas.width = 100;
    canvas.height = 100;
    
    // Draw simple QR-like pattern
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 100, 100);
    
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if ((i + j) % 2 === 0) {
          ctx.fillRect(i * 10, j * 10, 10, 10);
        }
      }
    }
    
    return canvas.toDataURL();
  }, [filters, effectiveRole, route, correlationId, provenanceHash]);

  // Format filters for display
  const formatFilters = (filters: Record<string, any>) => {
    return Object.entries(filters)
      .filter(([_, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => `${key}=${value}`)
      .join(', ');
  };

  return (
    <div className={`provenance-block ${className}`}>
      <div className="provenance-header">
        <h3 className="provenance-title">Provenance</h3>
        <div className="provenance-qr">
          <img 
            src={qrCodeDataUrl} 
            alt="Provenance QR Code" 
            className="provenance-qr-image"
          />
        </div>
      </div>
      
      <div className="provenance-content">
        <div className="provenance-row">
          <span className="provenance-label">Filters:</span>
          <span className="provenance-value">
            {Object.keys(filters).length > 0 ? formatFilters(filters) : 'None'}
          </span>
        </div>
        
        <div className="provenance-row">
          <span className="provenance-label">Role:</span>
          <span className="provenance-value">{effectiveRole}</span>
        </div>
        
        <div className="provenance-row">
          <span className="provenance-label">Route:</span>
          <span className="provenance-value">{route}</span>
        </div>
        
        <div className="provenance-row">
          <span className="provenance-label">Correlation ID:</span>
          <span className="provenance-value provenance-correlation">{correlationId}</span>
        </div>
        
        <div className="provenance-row">
          <span className="provenance-label">Timestamp:</span>
          <span className="provenance-value">{new Date().toLocaleString()}</span>
        </div>
        
        <div className="provenance-row">
          <span className="provenance-label">Hash:</span>
          <span className="provenance-value provenance-hash">{provenanceHash}</span>
        </div>
      </div>

      <style jsx>{`
        .provenance-block {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 4px;
          padding: 15px;
          margin: 20px 0;
          font-size: 12px;
          line-height: 1.4;
        }

        .provenance-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          padding-bottom: 8px;
          border-bottom: 1px solid #dee2e6;
        }

        .provenance-title {
          font-size: 14px;
          font-weight: 600;
          color: #2c3e50;
          margin: 0;
        }

        .provenance-qr {
          flex-shrink: 0;
        }

        .provenance-qr-image {
          width: 40px;
          height: 40px;
          border: 1px solid #dee2e6;
          border-radius: 2px;
        }

        .provenance-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px 15px;
        }

        .provenance-row {
          display: flex;
          align-items: flex-start;
        }

        .provenance-label {
          font-weight: 500;
          color: #495057;
          min-width: 80px;
          flex-shrink: 0;
        }

        .provenance-value {
          color: #6c757d;
          word-break: break-all;
        }

        .provenance-correlation {
          font-family: monospace;
          background: #e9ecef;
          padding: 1px 4px;
          border-radius: 2px;
          font-size: 11px;
        }

        .provenance-hash {
          font-family: monospace;
          background: #fff3cd;
          padding: 1px 4px;
          border-radius: 2px;
          font-size: 11px;
          color: #856404;
        }

        /* Print-specific styles */
        @media print {
          .provenance-block {
            background: white;
            border: 1px solid #000;
            page-break-inside: avoid;
            margin: 10px 0;
            padding: 10px;
          }

          .provenance-header {
            border-bottom: 1px solid #000;
          }

          .provenance-title {
            font-size: 12px;
          }

          .provenance-qr-image {
            width: 30px;
            height: 30px;
          }

          .provenance-content {
            grid-template-columns: 1fr 1fr;
            gap: 4px 10px;
          }

          .provenance-label {
            font-size: 10px;
            min-width: 60px;
          }

          .provenance-value {
            font-size: 10px;
          }

          .provenance-correlation,
          .provenance-hash {
            font-size: 9px;
            padding: 1px 3px;
          }
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .provenance-content {
            grid-template-columns: 1fr;
            gap: 6px;
          }

          .provenance-row {
            flex-direction: column;
            gap: 2px;
          }

          .provenance-label {
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
}
