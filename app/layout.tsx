import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from './components/Header'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { Toaster } from 'react-hot-toast';
import { globalStyles } from '@/styles/common';
import { AuthProvider } from './providers/auth-provider';
import { QueryProvider } from './providers/query-provider';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Link Manager',
  description: 'Manage your links, YouTube videos and prompts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      </head>
      <body className={`${inter.className} dark:bg-gray-900 dark:text-white transition-colors`}>
        <QueryProvider>
          <AuthProvider>
            <ThemeProvider>
              <Toaster position="top-right" />
              <Header />
              <main className="mt-6">
                {children}
              </main>
            </ThemeProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
