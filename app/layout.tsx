import type React from "react"
import type { Metadata } from "next"
import { Roboto, Public_Sans, Poppins } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/contexts/AuthContext"
import "./globals.css"

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-roboto",
})

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["800"],
  variable: "--font-public-sans",
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "Dashboard Meu Assessor",
  description: "Dashboard de investimentos e operações",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${roboto.variable} ${publicSans.variable} ${poppins.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  )
}
