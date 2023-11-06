import Header from '@/app/header';
import { cn } from '@/lib/utils';
import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider afterSignInUrl="/main" afterSignUpUrl="/onboarding">
      <html lang="ja">
        <body className={cn(inter.className, 'container max-w-xl')}>
          <Header />
          <main className="py-10">{children}</main>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
