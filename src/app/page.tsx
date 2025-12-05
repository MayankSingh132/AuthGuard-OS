'use client';

import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { redirect } from 'next/navigation';

export default function Home() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (!user || user.isAnonymous) {
    redirect('/login');
  } else {
    redirect('/dashboard');
  }
}
