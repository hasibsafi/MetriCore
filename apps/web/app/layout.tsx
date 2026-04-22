import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MetriCore — Site health, traffic, and search in one view",
  description:
    "Track health, traffic, and search impact without jumping between tools.",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" }
    ]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var m=localStorage.getItem('mc-theme-manual')==='1';var s=localStorage.getItem('mc-theme');var t=m&&s==='light'?'light':'dark';document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='dark';}"
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
