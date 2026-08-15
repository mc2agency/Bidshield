'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

// Controlled search input that pushes ?q= to the URL on submit. Kept as a
// tiny client island so the main blog page can stay fully server-rendered.
export function BlogSearch({ initialQuery = '' }: { initialQuery?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  const submit = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set('q', next);
    else params.delete('q');
    startTransition(() => {
      router.push(`/blog${params.toString() ? `?${params.toString()}` : ''}`);
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit(value);
      }}
    >
      <input
        type="text"
        placeholder="Search articles..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        disabled={isPending}
      />
    </form>
  );
}
