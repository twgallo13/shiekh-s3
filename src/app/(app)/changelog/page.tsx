import { VersionBadge } from '@/components/VersionBadge';

export default function ChangelogPage() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Changelog
              </h1>
              <VersionBadge />
            </div>

            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">v0.1.0</h3>
                  <span className="text-sm text-gray-500">Bootstrap</span>
                </div>
                <p className="text-gray-600 mb-3">
                  Initial bootstrap version with core infrastructure.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Next.js 14 with App Router and TypeScript</li>
                  <li>• Tailwind CSS and shadcn/ui components</li>
                  <li>• Prisma with SQLite database</li>
                  <li>• Version badge and health endpoint</li>
                  <li>• Audit logging system</li>
                  <li>• Basic role-based navigation</li>
                  <li>• ESLint, Prettier, and testing setup</li>
                </ul>
              </div>

              <div className="border-l-4 border-gray-300 pl-4">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-500">v0.2.0</h3>
                  <span className="text-sm text-gray-400">Planned</span>
                </div>
                <p className="text-gray-500 mb-3">
                  Role switcher with SSR-safe persistence and guards.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Dynamic role switching</li>
                  <li>• Role-based route guards</li>
                  <li>• Settings page with role information</li>
                </ul>
              </div>

              <div className="border-l-4 border-gray-300 pl-4">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-500">v0.3.0</h3>
                  <span className="text-sm text-gray-400">Planned</span>
                </div>
                <p className="text-gray-500 mb-3">
                  Manager chat memory with sessions, recall, TTL, and pins.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Chat interface with memory</li>
                  <li>• Role-scoped memory storage</li>
                  <li>• TTL and pinning support</li>
                </ul>
              </div>

              <div className="border-l-4 border-gray-300 pl-4">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-500">v0.4.0</h3>
                  <span className="text-sm text-gray-400">Planned</span>
                </div>
                <p className="text-gray-500 mb-3">
                  structure.md ingestion for canonical roles and navigation.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• YAML frontmatter parsing</li>
                  <li>• Dynamic navigation from structure</li>
                  <li>• Route guarding based on structure</li>
                </ul>
              </div>

              <div className="border-l-4 border-gray-300 pl-4">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-500">v0.5.0</h3>
                  <span className="text-sm text-gray-400">Planned</span>
                </div>
                <p className="text-gray-500 mb-3">
                  In-app changelog and deploy audit.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• About page with changelog</li>
                  <li>• Deploy audit idempotency</li>
                  <li>• Version history tracking</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
