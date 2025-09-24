import { VersionBadge } from '@/components/VersionBadge';
import { Role } from '@/lib/guards';

export default function SettingsPage() {
  // For now, we'll use ADMIN role as default - in v0.2.0 this will be dynamic
  const currentRole: Role = Role.ADMIN;

  const roleDescriptions: Record<Role, string> = {
    [Role.ADMIN]: 'System administrator with full access to all features and settings.',
    [Role.FM]: 'Facility Manager with global logistics authority and almost unlimited permissions.',
    [Role.WHS]: 'Warehouse Supervisor with trusted management capabilities for warehouse operations.',
    [Role.DM]: 'District Manager overseeing assigned stores with approval and monitoring capabilities.',
    [Role.SM]: 'Store Manager with store-level supply management and receiving permissions.',
    [Role.AM]: 'Assistant Manager with limited store-level permissions.',
    [Role.COST_ANALYST]: 'Cost Analyst with read-only access to financial data and cost information.',
    [Role.AI_AGENT]: 'AI Agent for automated forecasting and draft order generation.',
  };

  const rolePermissions: Record<Role, string[]> = {
    [Role.ADMIN]: ['All permissions', 'User management', 'System configuration', 'Audit access'],
    [Role.FM]: ['Global logistics', 'Product management', 'Order approval', 'Variance resolution'],
    [Role.WHS]: ['Warehouse operations', 'Product management', 'Receiving', 'Picking/Packing'],
    [Role.DM]: ['Store oversight', 'Request approval', 'Compliance monitoring'],
    [Role.SM]: ['Store receiving', 'Variance reporting', 'Catalog browsing'],
    [Role.AM]: ['Store receiving', 'Variance reporting', 'Catalog browsing'],
    [Role.COST_ANALYST]: ['Cost visibility', 'Financial reporting', 'Budget monitoring'],
    [Role.AI_AGENT]: ['Forecasting', 'Draft order generation', 'Anomaly detection'],
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Settings
              </h1>
              <VersionBadge />
            </div>

            <div className="space-y-8">
              {/* Current Role Section */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h2 className="text-lg font-semibold text-blue-900 mb-3">
                  Current Role
                </h2>
                <div className="flex items-center space-x-3 mb-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {currentRole}
                  </span>
                  <span className="text-sm text-blue-700">
                    {roleDescriptions[currentRole]}
                  </span>
                </div>
                <div className="text-sm text-blue-600">
                  <strong>Permissions:</strong>
                  <ul className="mt-1 space-y-1">
                    {rolePermissions[currentRole].map((permission, index) => (
                      <li key={index}>• {permission}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* System Information */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  System Information
                </h2>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Version</dt>
                    <dd className="mt-1 text-sm text-gray-900">v0.1.0</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Environment</dt>
                    <dd className="mt-1 text-sm text-gray-900">Development</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Database</dt>
                    <dd className="mt-1 text-sm text-gray-900">SQLite (dev.db)</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Framework</dt>
                    <dd className="mt-1 text-sm text-gray-900">Next.js 14</dd>
                  </div>
                </dl>
              </div>

              {/* API Endpoints */}
              <div className="bg-green-50 p-6 rounded-lg">
                <h2 className="text-lg font-semibold text-green-900 mb-3">
                  API Endpoints
                </h2>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-700">Health Check</span>
                    <code className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      GET /api/health
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-700">Audit Logging</span>
                    <code className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      POST /api/audit
                    </code>
                  </div>
                </div>
              </div>

              {/* Coming Soon */}
              <div className="bg-yellow-50 p-6 rounded-lg">
                <h2 className="text-lg font-semibold text-yellow-900 mb-3">
                  Coming Soon
                </h2>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Role switching (v0.2.0)</li>
                  <li>• Chat memory system (v0.3.0)</li>
                  <li>• structure.md integration (v0.4.0)</li>
                  <li>• Enhanced audit and changelog (v0.5.0)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
