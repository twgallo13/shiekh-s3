"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <html lang="en"><body className="p-6">
      <h1 className="text-xl font-semibold mb-3">Something went wrong</h1>
      <div className="flex gap-3">
        <button onClick={() => reset()} className="px-3 py-2 border rounded">Try again</button>
        <a href="/" className="px-3 py-2 border rounded">Go home</a>
      </div>
    </body></html>
  );
}
