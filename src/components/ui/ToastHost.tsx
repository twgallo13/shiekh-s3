'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAlerts } from '@/lib/alerts/bus';

export default function ToastHost() {
  const { list } = useAlerts();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div role="status" aria-live="polite" className="fixed top-4 right-4 z-[1000] space-y-2">
      {list.slice(0, 3).map(a => (
        <div key={a.id} className="rounded-lg shadow p-3 bg-white dark:bg-neutral-900 min-w-[260px]">
          <div className="font-medium">{a.title}</div>
          <p className="text-sm opacity-90">{a.message}</p>
          {a.href && <a className="underline text-sm" href={a.href}>View details</a>}
        </div>
      ))}
    </div>,
    document.body
  );
}