import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Paddock Simulator | Manjanium',
  description: 'F1 Racing Simulator',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-[#131313] text-white">{children}</body>
    </html>
  )
}
