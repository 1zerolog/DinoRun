import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"

export const metadata: Metadata = {
  other: {
    "fc:miniapp": JSON.stringify({
      version: "1",
      imageUrl: "https://dino-run-game-zeta.vercel.app/dino-hero.svg",
      button: { title: "Launch Dino", action: { name: "Launch Dino", type: "launch_miniapp" } }
    })
  },
  title: "Dino Game - Fast and Classic Dino",
  description: "Smooth, touch-enabled classic dino running game in your browser.",
  openGraph: {
    title: "Dino Game",
    description: "A fast mini game discoverable on Base.",
    images: [
      {
        url: "/dino-hero.svg",
        width: 1200,
        height: 630,
        alt: "Dino Game",
      },
    ],
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
