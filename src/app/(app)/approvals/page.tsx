import { VersionBadge } from '@/components/VersionBadge';
import { Role } from '@/lib/guards';
import ApproveDeny from '@/components/approvals/ApproveDeny';
import { cookies } from 'next/headers';

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  // Get role from cookie if available, fallback to ADMIN
  const cookieStore = await cookies();
  const roleCookie = cookieStore.get('x-role')?.value;
  const currentRole: Role = (roleCookie as Role) || Role.ADMIN;

  // Mock approval data - in a real app this would come from the database
  const mockApprovals = [
    { id: '1', user: 'John Doe', action: 'granted', target: 'Purchase Order #12345', timestamp: new Date().toISOString() },
    { id: '2', user: 'Jane Smith', action: 'denied', target: 'Budget Request #67890', timestamp: new Date().toISOString() },
    { id: '3', user: 'Bob Wilson', action: 'pending', target: 'Equipment Request #11111', timestamp: new Date().toISOString() },
  ];

  // Check if user has permission to view approvals (ADMIN/FM/DM can view)
  const canViewApprovals = [Role.ADMIN, Role.FM, Role.DM].includes(currentRole);

  if (!canViewApprovals) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Approvals</h1>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Access Denied
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>You do not have permission to view approval requests. Only ADMIN, FM, and DM roles can access this page.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Approvals</h1>
        <VersionBadge />
      </div>

      {/* Approval Status Banners */}
      <div className="space-y-4">
        {mockApprovals.map((approval) => (
          <div key={approval.id}>
            {approval.action === 'granted' && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Approval Granted
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p><strong>{approval.user}</strong> granted approval for <strong>{approval.target}</strong></p>
                      <p className="mt-1 text-xs text-green-600">Approved on {new Date(approval.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {approval.action === 'denied' && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Approval Denied
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p><strong>{approval.user}</strong> denied approval for <strong>{approval.target}</strong></p>
                      <p className="mt-1 text-xs text-red-600">Denied on {new Date(approval.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {approval.action === 'pending' && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex justify-between items-start">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        Approval Pending
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p><strong>{approval.user}</strong> requested approval for <strong>{approval.target}</strong></p>
                        <p className="mt-1 text-xs text-blue-600">Requested on {new Date(approval.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <ApproveDeny targetId={approval.id} role={currentRole as "ADMIN" | "FM" | "WHS" | "DM" | "SM" | "AM" | "ANON"} />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* API Information */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          API Information
        </h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Approvals API</span>
            <code className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
              POST /api/approvals
            </code>
          </div>
          <div className="text-sm text-gray-600">
            <p>Actions: <code className="bg-gray-100 px-1 rounded">request</code>, <code className="bg-gray-100 px-1 rounded">grant</code>, <code className="bg-gray-100 px-1 rounded">deny</code></p>
            <p className="mt-1">RBAC: Only ADMIN and FM roles can grant/deny approvals</p>
          </div>
        </div>
      </div>
    </div>
  );
}
