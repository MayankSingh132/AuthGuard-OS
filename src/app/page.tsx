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

  // If there is a user and they are not anonymous, go to the dashboard.
  // Otherwise, they must log in.
  if (user && !user.isAnonymous) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
