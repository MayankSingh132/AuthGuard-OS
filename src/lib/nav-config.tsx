import React from 'react';
import type { ReactNode } from 'react';
import {
  AlertTriangle,
  CloudCog,
  Database,
  KeyRound,
  LayoutDashboard,
  Network,
  ShieldCheck,
  TerminalSquare,
} from 'lucide-react';

export type NavItem = {
  title: string;
  href: string;
  icon: ReactNode;
};

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard />,
  },
  {
    title: 'Architecture',
    href: '/architecture',
    icon: <Network />,
  },
  {
    title: 'Database Schema',
    href: '/database',
    icon: <Database />,
  },
  {
    title: 'Cloud Functions',
    href: '/functions',
    icon: <CloudCog />,
  },
  {
    title: 'Security Rules',
    href: '/security-rules',
    icon: <ShieldCheck />,
  },
  {
    title: 'MFA Flow',
    href: '/mfa-flow',
    icon: <KeyRound />,
  },
  {
    title: 'OS Integration',
    href: '/integration',
    icon: <TerminalSquare />,
  },
  {
    title: 'Threat Model',
    href: '/threat-model',
    icon: <AlertTriangle />,
  },
];
