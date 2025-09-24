import { APP_VERSION } from '@/app/version';

interface VersionBadgeProps {
  className?: string;
}

export function VersionBadge({ className = '' }: VersionBadgeProps) {
  return (
    <div 
      data-testid="version-badge"
      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 ${className}`}
    >
      <span className="mr-1">📦</span>
      {APP_VERSION}
    </div>
  );
}
