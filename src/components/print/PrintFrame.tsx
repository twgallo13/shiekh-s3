"use client";
import React from "react";
import { APP_VERSION } from "@/app/version";

interface PrintFrameProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

/**
 * PrintFrame Component
 * Standard print shell with header, footer, and page-break rules
 * Provides consistent margins and running headers/footers for PDF generation
 */
export default function PrintFrame({ 
  children, 
  title = "Shiekh Supply S3 Report",
  subtitle,
  className = "" 
}: PrintFrameProps) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const buildHash = APP_VERSION.replace('v', '').replace(/\./g, '');

  return (
    <div className={`print-frame ${className}`}>
      {/* Print Header */}
      <div className="print-header">
        <div className="print-header-content">
          <div className="print-logo">
            <div className="print-logo-text">Shiekh Supply S3</div>
            <div className="print-logo-subtitle">Master Specification v14.0.0</div>
          </div>
          <div className="print-header-info">
            <div className="print-title">{title}</div>
            {subtitle && <div className="print-subtitle">{subtitle}</div>}
            <div className="print-timestamp">{currentDate}</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="print-content">
        {children}
      </div>

      {/* Print Footer */}
      <div className="print-footer">
        <div className="print-footer-content">
          <div className="print-footer-left">
            <span className="print-page-info">
              Page <span className="print-page-number"></span> of <span className="print-page-total"></span>
            </span>
          </div>
          <div className="print-footer-center">
            <span className="print-build-hash">Build: {buildHash}</span>
          </div>
          <div className="print-footer-right">
            <span className="print-contact">Contact: support@shiekhsupply.com</span>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        .print-frame {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .print-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 80px;
          background: #f8f9fa;
          border-bottom: 2px solid #e9ecef;
          z-index: 1000;
        }

        .print-header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 100%;
          padding: 0 20px;
          max-width: 100%;
        }

        .print-logo {
          flex-shrink: 0;
        }

        .print-logo-text {
          font-size: 18px;
          font-weight: bold;
          color: #2c3e50;
          line-height: 1.2;
        }

        .print-logo-subtitle {
          font-size: 12px;
          color: #6c757d;
          line-height: 1.2;
        }

        .print-header-info {
          text-align: right;
          flex-grow: 1;
          margin-left: 20px;
        }

        .print-title {
          font-size: 16px;
          font-weight: 600;
          color: #2c3e50;
          line-height: 1.2;
        }

        .print-subtitle {
          font-size: 14px;
          color: #6c757d;
          line-height: 1.2;
          margin-top: 2px;
        }

        .print-timestamp {
          font-size: 12px;
          color: #6c757d;
          line-height: 1.2;
          margin-top: 2px;
        }

        .print-content {
          flex: 1;
          margin-top: 80px;
          margin-bottom: 60px;
          padding: 20px;
          min-height: calc(100vh - 140px);
        }

        .print-footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: #f8f9fa;
          border-top: 1px solid #e9ecef;
          z-index: 1000;
        }

        .print-footer-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 100%;
          padding: 0 20px;
          font-size: 12px;
          color: #6c757d;
        }

        .print-footer-left,
        .print-footer-center,
        .print-footer-right {
          flex: 1;
        }

        .print-footer-center {
          text-align: center;
        }

        .print-footer-right {
          text-align: right;
        }

        .print-page-info {
          font-weight: 500;
        }

        .print-build-hash {
          font-family: monospace;
          background: #e9ecef;
          padding: 2px 6px;
          border-radius: 3px;
        }

        .print-contact {
          color: #007bff;
        }

        /* Print-specific styles */
        @media print {
          .print-frame {
            min-height: auto;
          }

          .print-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 60px;
            background: white;
            border-bottom: 1px solid #000;
          }

          .print-header-content {
            padding: 0 15px;
          }

          .print-logo-text {
            font-size: 16px;
          }

          .print-logo-subtitle {
            font-size: 10px;
          }

          .print-title {
            font-size: 14px;
          }

          .print-subtitle {
            font-size: 12px;
          }

          .print-timestamp {
            font-size: 10px;
          }

          .print-content {
            margin-top: 60px;
            margin-bottom: 40px;
            padding: 15px;
          }

          .print-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 40px;
            background: white;
            border-top: 1px solid #000;
          }

          .print-footer-content {
            padding: 0 15px;
            font-size: 10px;
          }

          /* Page break utilities */
          .break-before {
            page-break-before: always;
          }

          .break-after {
            page-break-after: always;
          }

          .avoid-break {
            page-break-inside: avoid;
          }

          .break-inside-avoid {
            page-break-inside: avoid;
          }

          /* Table-specific print styles */
          .print-table {
            page-break-inside: avoid;
          }

          .print-table thead {
            display: table-header-group;
          }

          .print-table tbody {
            display: table-row-group;
          }

          .print-table tr {
            page-break-inside: avoid;
          }

          /* Ensure proper page numbering */
          @page {
            margin: 60px 15px 40px 15px;
            @top-center {
              content: "Shiekh Supply S3 Report";
              font-size: 10px;
              color: #666;
            }
            @bottom-center {
              content: "Page " counter(page) " of " counter(pages);
              font-size: 10px;
              color: #666;
            }
          }
        }
      `}</style>
    </div>
  );
}
