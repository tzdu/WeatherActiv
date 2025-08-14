// File: app/layout.tsx
export const metadata = {
  title: "WeatherActiV",
  description: "Weather-aware planning dashboard",
};
// src/app/layout.tsx
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased selection:bg-blue-200">
        {children}
      </body>
    </html>
  );
}