// /src/app/admin/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page just acts as a redirect to the first admin section.
export default function AdminRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/organizations');
  }, [router]);

  return null; // Or a loading spinner
}
