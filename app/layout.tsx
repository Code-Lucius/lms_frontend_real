import type { Metadata } from "next";
import "./globals.css";
import { SubscriptionProvider } from "@/lib/subscription";
import { DemoNavigator } from "@/components/DemoNavigator";

export const metadata: Metadata = {
  title: "Archdiocese LMS",
  description: "Learning Management System for the Archdiocese — parishes, regions, deaneries, and parishioners.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SubscriptionProvider>
          <DemoNavigator />
          {children}
        </SubscriptionProvider>
      </body>
    </html>
  );
}
