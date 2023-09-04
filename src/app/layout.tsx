import './landing.css';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';;

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Habit Harbor',
  description: 'App inspired by Atomic Habits book',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
      <Analytics />
    </html>
  )
}
