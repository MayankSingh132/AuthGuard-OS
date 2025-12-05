'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Fingerprint } from 'lucide-react';
import React, { useEffect } from 'react';

import { navItems } from '@/lib/nav-config.tsx';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { initiateAnonymousSignIn, useAuth } from '@/firebase';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && !user) {
      // If user is not logged in and not loading, check if they are anonymous
      // If not, redirect to login
      if (auth.currentUser && auth.currentUser.isAnonymous) {
        // already handling anon
      } else {
        initiateAnonymousSignIn(auth);
      }
    }
  }, [user, isUserLoading, router, auth]);
  
  if (isUserLoading) {
    return (
       <div className="flex min-h-screen">
        <div className="hidden md:flex flex-col gap-4 w-64 p-4 border-r">
          <div className="flex items-center gap-2.5 p-2 pr-4">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-6 w-32" />
          </div>
          <div className="flex flex-col gap-2 mt-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
        <div className="flex-1 p-8">
            <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="relative min-h-screen bg-background">
        <Sidebar>
          <SidebarHeader>
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 p-2 pr-4"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Fingerprint className="h-5 w-5" />
              </div>
              <span className="text-lg font-semibold text-sidebar-foreground">
                AuthGuard OS
              </span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className="justify-start"
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <div className="flex flex-col md:ml-64">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 md:hidden">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Fingerprint className="h-5 w-5" />
              </div>
              <span className="text-lg font-semibold">AuthGuard OS</span>
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
