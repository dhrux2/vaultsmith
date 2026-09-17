import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import ThemeSync from "@/components/ThemeSync";
import "./globals.css";

const sans = localFont({
  variable: "--font-sans",
  display: "swap",
  src: [
    { path: "./fonts/DisplaySans-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/DisplaySans-Medium.otf", weight: "500", style: "normal" },
    { path: "./fonts/DisplaySans-Semibold.otf", weight: "600", style: "normal" },
    { path: "./fonts/DisplaySans-Bold.otf", weight: "700", style: "normal" },
  ],
});

const serif = localFont({
  variable: "--font-serif",
  display: "swap",
  src: [
    { path: "./fonts/DisplaySerif-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/DisplaySerif-RegularItalic.otf", weight: "400", style: "italic" },
    { path: "./fonts/DisplaySerif-Medium.otf", weight: "500", style: "normal" },
    { path: "./fonts/DisplaySerif-MediumItalic.otf", weight: "500", style: "italic" },
  ],
});

export const metadata: Metadata = {
  title: "Vaultsmith",
  description: "Forge strong passwords and passphrases, with real entropy math, right in your browser.",
  icons: {
    // Light icon for a dark UI and vice versa; ThemeSync keeps this in step
    // with the site theme after load.
    icon: [
      { url: "/favicon-light.png", media: "(prefers-color-scheme: light)", type: "image/png" },
      { url: "/favicon-dark.png", media: "(prefers-color-scheme: dark)", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7f7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

// Runs before paint so the theme never flashes: a theme the user picked wins,
// otherwise follow the device setting.
const themeScript = `try{var t=localStorage.getItem('vaultsmith-theme');if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <ThemeSync />
        {children}
      </body>
    </html>
  );
}
