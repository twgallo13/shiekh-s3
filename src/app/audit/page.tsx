"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import AuditTable from "@/components/ui/AuditTable";
import ComplianceTable from "@/components/ui/ComplianceTable";
import { useRole } from "@/components/providers/RoleProvider";

/**
 * Audit Page - Admin/FM Only
 * Provides tabs for Audit Log and Compliance Events
 * RBAC: Only accessible to Admin and Finance Manager roles
 */
export default function AuditPage() {
  const { effectiveRole } = useRole();
  const [activeTab, setActiveTab] = useState<'audit' | 'compliance'>('audit');

  // RBAC check - only Admin and FM can access
  if (!["ADMIN", "FM"].includes(effectiveRole)) {
    return (
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <div className="text-red-600 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Permission Denied</h1>
                <p className="text-gray-600 mb-6">
                  You do not have permission to access audit and compliance data.
                </p>
                <p className="text-sm text-gray-500">
                  This section is restricted to Admin and Finance Manager roles only.
                </p>
                <div className="mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => window.history.back()}
                  >
                    Go Back
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Audit & Compliance</h1>
          <p className="text-gray-600">
            View audit logs and compliance events for regulatory and security purposes.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('audit')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'audit'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Audit Log
              </button>
              <button
                onClick={() => setActiveTab('compliance')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'compliance'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Compliance Events
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Audit Log</h2>
              <Button
                variant="outline"
                onClick={() => window.open('/audit/print', '_blank')}
              >
                Print View
              </Button>
            </div>
            <AuditTable />
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Compliance Events</h2>
              <Button
                variant="outline"
                onClick={() => window.open('/audit/print?tab=compliance', '_blank')}
              >
                Print View
              </Button>
            </div>
            <ComplianceTable />
          </div>
        )}

        {/* Footer Information */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-blue-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-sm text-blue-800">
              <h3 className="font-medium mb-1">Audit Data Information</h3>
              <ul className="space-y-1 text-xs">
                <li>• All audit entries are immutable and cannot be modified (per §13.3)</li>
                <li>• Data retention follows regulatory compliance requirements</li>
                <li>• Access is logged and monitored for security purposes</li>
                <li>• Export and print functions preserve data integrity</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}