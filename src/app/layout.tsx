import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Student Office Management System", template: "%s | Student Office Management System" },
  description: "Avantika University student office portal. Academic project demonstration with fictional data.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
