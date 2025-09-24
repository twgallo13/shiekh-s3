import { VersionBadge } from '@/components/VersionBadge';
import { SafeLink } from '@/components/SafeLink';
import { loadStructure } from '@/lib/structure';
import { Role } from '@/lib/guards';
import '../../lib/listeners/log-to-console';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structure = await loadStructure();
  
  // For now, we'll use ADMIN role as default - in v0.2.0 this will be dynamic
  const currentRole: Role = Role.ADMIN;
  const navigation = structure.navigation.filter(item => 
    item.roles.includes(currentRole)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-semibold text-gray-900">
                Shiekh Supply S3
              </h1>
              <nav className="hidden md:flex space-x-8">
                {navigation.map((item) => (
                  <SafeLink
                    key={item.path}
                    href={item.path}
                    className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    {item.title}
                  </SafeLink>
                ))}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <VersionBadge />
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
