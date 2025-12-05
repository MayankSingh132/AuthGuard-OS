'use client';

import { redirect } from 'next/navigation';

export default function Home() {
  // Always redirect to the dashboard, as authentication is handled automatically.
  redirect('/dashboard');
}
