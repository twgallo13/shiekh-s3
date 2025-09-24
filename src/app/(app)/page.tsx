import { VersionBadge } from '@/components/VersionBadge';
import { SafeLink } from '@/components/SafeLink';

export default function HomePage() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to Shiekh Supply S3
            </h1>
            <p className="text-gray-600 mb-6">
              The authoritative supply management platform for all non-merchandise supplies 
              across the Shiekh retail and warehouse network.
            </p>
            
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <VersionBadge />
                <span className="text-sm text-gray-500">
                  Bootstrap version with version badge, CI, and audit stubs
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-blue-900 mb-2">
                  📋 Changelog
                </h3>
                <p className="text-blue-700 mb-4">
                  View the latest updates and version history.
                </p>
                <SafeLink
                  href="/changelog"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                  View Changelog
                </SafeLink>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-green-900 mb-2">
                  ⚙️ Settings
                </h3>
                <p className="text-green-700 mb-4">
                  Configure your preferences and system settings.
                </p>
                <SafeLink
                  href="/settings"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                >
                  Open Settings
                </SafeLink>
              </div>
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                🚀 Quick Start
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Check the health endpoint at <code className="bg-gray-200 px-1 rounded">/api/health</code></li>
                <li>• Test audit logging at <code className="bg-gray-200 px-1 rounded">/api/audit</code></li>
                <li>• View version information in the header badge</li>
                <li>• Explore navigation based on your role permissions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
