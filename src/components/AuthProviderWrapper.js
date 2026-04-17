'use client';

import dynamic from 'next/dynamic';

const DynamicAuthProvider = dynamic(
  () => import('../contexts/AuthContext').then(mod => mod.AuthProvider),
  { ssr: true } // Keep SSR to avoid hydration mismatch
);

export default function AuthProviderWrapper({ children }) {
  return (
    <DynamicAuthProvider>
      {children}
    </DynamicAuthProvider>
  );
}
