// Prevent static prerendering — Navigation uses Clerk hooks which require
// ClerkProvider to be hydrated. Force dynamic rendering avoids the
// "useClerk can only be used within <ClerkProvider>" build error.
export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-slate-900 mb-4">404</h1>
      <p className="text-xl text-slate-600 mb-8">Page not found</p>
      <a
        href="/"
        className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
      >
        Go home
      </a>
    </div>
  );
}
