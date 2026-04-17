import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AuthProviderWrapper from "../components/AuthProviderWrapper";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata = {
  title: "TaskForce",
  description: "TaskForce - Kinetic Editorial UI",
  preconnect: [
    { href: 'https://apis.google.com', crossOrigin: 'anonymous' },
    { href: 'https://fonts.googleapis.com', crossOrigin: 'anonymous' },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${inter.variable} ${manrope.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://apis.google.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body className="min-h-full flex flex-col app-shell">
        <AuthProviderWrapper>
          <Header />
          <main className="flex-1 min-h-0">{children}</main>
          <Footer />
        </AuthProviderWrapper>
      </body>
    </html>
  );
}
