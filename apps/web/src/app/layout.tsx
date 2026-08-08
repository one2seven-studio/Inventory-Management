import type { Metadata } from "next";
import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const headlineFont = Hanken_Grotesk({
  variable: "--font-headline",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const monoFont = JetBrains_Mono({
  variable: "--font-data-mono",
  subsets: ["latin"],
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  title: "Smart Inventory",
  description: "Restaurant Inventory & Stock Management Platform",
};

// Light is the CSS default (bare :root in globals.css) — this only needs to
// apply dark, and only when a returning visitor previously chose it via
// ThemeToggle. Runs synchronously before first paint so there's no flash of
// light-then-dark for those users; light-by-default visitors pay no cost.
const NO_FLASH_THEME_SCRIPT = `try{if(localStorage.getItem("theme")==="dark")document.documentElement.setAttribute("data-theme","dark");}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${headlineFont.variable} ${bodyFont.variable} ${monoFont.variable} h-full antialiased`}
      // The no-flash theme script below sets data-theme on this element
      // before React hydrates (reading localStorage, which only exists
      // client-side) — the server never renders that attribute, so this
      // one specific, expected mismatch needs to be told apart from a real
      // hydration bug. Only suppresses the warning for *this* element's own
      // attributes, not anything inside <body> — a real mismatch anywhere
      // else still surfaces normally.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_THEME_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col font-body">{children}</body>
    </html>
  );
}
