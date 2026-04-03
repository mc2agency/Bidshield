'use client';

import { SignIn } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

export default function SignInPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            Sign in to BidShield
          </h2>
          <p className="mt-2 text-slate-600">
            A product of BidShield
          </p>
        </div>
        {isClient ? (
          <SignIn
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-xl"
              }
            }}
          />
        ) : (
          <div className="flex justify-center">
            <div className="animate-pulse bg-slate-200 rounded-lg w-full h-96" />
          </div>
        )}
      </div>
    </div>
  );
}
