import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Many's Photography | Cinematic Photography & Videography",
  description: 'Award-winning photography portfolio showcasing wedding, portrait, commercial, and video work. Experience our interactive 3D spinning wheel portfolio.',
  keywords: ['photography', 'wedding photographer', 'portrait photography', 'commercial photography', 'videography'],
  authors: [{ name: "Many's Photography" }],
  openGraph: {
    title: "Many's Photography",
    description: 'Award-winning photography portfolio',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Many's Photography",
    description: 'Award-winning photography portfolio',
  },
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="noise-overlay">
        {children}
      </body>
    </html>
  );
}
