import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { Toaster } from "sonner";
import { getLocale } from "@/lib/i18n";
import { LOCALE_DIR } from "@/lib/i18n/config";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: "سنتر أنمكا | ANMKA Center",
  description: "نظام إدارة سنتر تعليمي متكامل — الحضور، الامتحانات، المالية، وإشعارات أولياء الأمور.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const dir = LOCALE_DIR[locale];

  return (
    <html lang={locale} dir={dir} className={`${cairo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Toaster richColors position={dir === "rtl" ? "top-left" : "top-right"} />
      </body>
    </html>
  );
}
